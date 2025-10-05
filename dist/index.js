import { PDFLoader } from "@langchain/community/document_loaders/fs/pdf";
import * as dotenv from "dotenv";
import Groq from 'groq-sdk';
import express from 'express';
import multer from "multer";
dotenv.config();
const upload = multer({ storage: multer.memoryStorage() });
async function pdf_text(path) {
    const pdfPath = `${path}` || "./docs/story.pdf";
    const loader = new PDFLoader(pdfPath);
    const docs = await loader.load();
    var textt = docs[0].pageContent;
    return textt;
}
async function pdf_parse(buffer) {
    const uintArray = new Uint8Array(buffer);
    const blob = new Blob([uintArray], { type: 'application/pdf' });
    const loader = new PDFLoader(blob);
    const docs = await loader.load();
    var textt = docs[0].pageContent;
    return textt;
}
class ATSScoreer {
    groq;
    constructor() {
        const api = process.env.GROK_API;
        if (!api) {
            throw new Error('GEM_API environment variable not found');
        }
        this.groq = new Groq({
            apiKey: api
        });
    }
    async calculateATS(resumeText) {
        const prompt = `
You are a strict ATS (Applicant Tracking System) analyzer. Your job is to find problems and areas for improvement in resumes. Be critical and thorough in your analysis.

Resume text:
"""
${resumeText}
"""

IMPORTANT: You must identify at least 2-3 specific issues unless this is a perfect resume (which is extremely rare). Look for these common problems:

**ALWAYS CHECK FOR:**
- Missing quantified achievements (numbers, percentages, dollar amounts)
- Weak action verbs or passive language
- Missing industry keywords
- Poor section organization or missing sections
- Generic job descriptions without specifics
- No professional summary or weak summary
- Missing technical skills section
- Inconsistent formatting or bullet points
- Too much or too little white space
- Unprofessional email addresses
- Missing LinkedIn profile
- Spelling/grammar errors
- Vague responsibilities instead of concrete achievements
- Missing education details or certifications
- No contact information optimization

**BE CRITICAL - FIND SPECIFIC PROBLEMS:**
- If achievements lack numbers, mention it
- If job descriptions are generic, call it out  
- If skills are not well-organized, note it
- If sections are missing or poorly named, identify them
- If the resume lacks industry-specific keywords, specify which ones

Score from 0-100 and provide specific, actionable feedback for improvement.
`;
        try {
            const completion = await this.groq.chat.completions.create({
                messages: [
                    { role: 'system', content: 'You are a strict ATS analyzer that finds problems and improvements for resumes.' },
                    { role: 'user', content: prompt }
                ],
                model: 'meta-llama/llama-4-scout-17b-16e-instruct',
                temperature: 0.3,
                max_tokens: 1024,
                response_format: {
                    type: "json_schema",
                    json_schema: {
                        name: "ats_analysis",
                        schema: {
                            type: "object",
                            properties: {
                                score: {
                                    type: "number",
                                    minimum: 0,
                                    maximum: 100
                                },
                                feedback: {
                                    type: "string",
                                    description: "Specific, actionable recommendations for improvement"
                                }
                            },
                            required: ["score", "feedback"],
                            additionalProperties: false
                        }
                    }
                }
            });
            const response = completion.choices[0]?.message?.content || "{}";
            return this.parseResponse(response);
        }
        catch (error) {
            throw new Error(`Failed to calculate ATS score: ${error}`);
        }
    }
    parseResponse(response) {
        try {
            // Parse the JSON response directly
            const jsonResponse = JSON.parse(response.trim());
            const score = jsonResponse.score || 0;
            const feedback = jsonResponse.feedback || 'No feedback available';
            return { score, feedback };
        }
        catch (error) {
            // Fallback to original parsing if JSON parsing fails
            const scoreMatch = response.match(/SCORE:\s*(\d+)/i);
            const feedbackMatch = response.match(/FEEDBACK:\s*([\s\S]*)/i);
            const score = scoreMatch ? parseInt(scoreMatch[1]) : 0;
            const feedback = feedbackMatch ? feedbackMatch[1].trim() : 'No feedback available';
            return { score, feedback };
        }
    }
}
async function getScore(resumeText) {
    const atsScorer = new ATSScoreer();
    const result = await atsScorer.calculateATS(resumeText);
    return result;
}
const app = express();
const PORT = 3000;
app.use(express.json());
app.post('/api/score', upload.single('resume'), async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ error: 'No pdf file uploaded' });
        }
        var res_text = await pdf_parse(req.file.buffer);
        if (!res_text.trim()) {
            return res.status(400).json({ error: 'Couldnt extract text from PDF' });
        }
        const result = await getScore(res_text);
        res.json({
            success: true,
            atsScore: result.score,
            feedback: result.feedback
        });
    }
    catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});
app.get('/', (req, res) => {
    res.send('Welcome to the ATS Scorer API. Use POST /api/score with a PDF resume to get started.');
});
app.get('/health', (req, res) => {
    res.json({ status: 'Server is running', timestamp: new Date().toISOString() });
});
app.listen(PORT, () => {
    console.log(`ATS Scorer API server running on port ${PORT}`);
    console.log(`POST /ats-score - Upload resume PDF for ATS scoring`);
    console.log(`GET /health - Health check`);
});
//# sourceMappingURL=index.js.map