import { PDFLoader } from "@langchain/community/document_loaders/fs/pdf";
import * as dotenv from "dotenv";
import { GoogleGenerativeAI } from '@google/generative-ai';
dotenv.config();
async function pdf_text(path) {
    const pdfPath = `${path}` || "./docs/story.pdf";
    const loader = new PDFLoader(pdfPath);
    const docs = await loader.load();
    var textt = docs[0].pageContent;
    return textt;
}
class ATSScoreer {
    genAI;
    constructor() {
        const api = process.env.GEM_API;
        if (!api) {
            throw new Error('GEM_API environment variable not found');
        }
        this.genAI = new GoogleGenerativeAI(api);
    }
    async calculateATS(resumeText) {
        const model = this.genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
        const prompt = `
Analyze this resume text and give it an ATS (Applicant Tracking System) score from 0 to 100.

Resume text:
"""
${resumeText}

"""

Please respond in this exact format:
SCORE: [number from 0-100]
FEEDBACK: [brief feedback about what's good and what needs improvement]
`;
        try {
            const result = await model.generateContent(prompt);
            const response = result.response.text();
            return this.parseResponse(response);
        }
        catch (error) {
            throw new Error(`Failed to calculate ATS score: ${error}`);
        }
    }
    parseResponse(response) {
        const scoreMatch = response.match(/SCORE:\s*(\d+)/i);
        const feedbackMatch = response.match(/FEEDBACK:\s*(.*)/i);
        const score = scoreMatch ? parseInt(scoreMatch[1]) : 0;
        const feedback = feedbackMatch ? feedbackMatch[1].trim() : 'No feedback available';
        return { score, feedback };
    }
}
async function getScore(resumeText) {
    const atsScorer = new ATSScoreer();
    const result = await atsScorer.calculateATS(resumeText);
    return result;
}
async function main() {
    try {
        var text = await pdf_text("./docs/Tamal Bhattacharjee.pdf");
        const result = await getScore(text);
        console.log("ATS Score:", result.score);
        console.log("Feedback:", result.feedback);
    }
    catch (error) {
        console.error(error);
    }
}
main();
