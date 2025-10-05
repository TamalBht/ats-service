"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g = Object.create((typeof Iterator === "function" ? Iterator : Object).prototype);
    return g.next = verb(0), g["throw"] = verb(1), g["return"] = verb(2), typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (g && (g = 0, op[0] && (_ = 0)), _) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
Object.defineProperty(exports, "__esModule", { value: true });
var pdf_1 = require("@langchain/community/document_loaders/fs/pdf");
var dotenv = require("dotenv");
var groq_sdk_1 = require("groq-sdk");
var express_1 = require("express");
var multer = require("multer");
dotenv.config();
var upload = multer({ storage: multer.memoryStorage() });
function pdf_text(path) {
    return __awaiter(this, void 0, void 0, function () {
        var pdfPath, loader, docs, textt;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    pdfPath = "".concat(path) || "./docs/story.pdf";
                    loader = new pdf_1.PDFLoader(pdfPath);
                    return [4 /*yield*/, loader.load()];
                case 1:
                    docs = _a.sent();
                    textt = docs[0].pageContent;
                    return [2 /*return*/, textt];
            }
        });
    });
}
function pdf_parse(buffer) {
    return __awaiter(this, void 0, void 0, function () {
        var uintArray, blob, loader, docs, textt;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    uintArray = new Uint8Array(buffer);
                    blob = new Blob([uintArray], { type: 'application/pdf' });
                    loader = new pdf_1.PDFLoader(blob);
                    return [4 /*yield*/, loader.load()];
                case 1:
                    docs = _a.sent();
                    textt = docs[0].pageContent;
                    return [2 /*return*/, textt];
            }
        });
    });
}
var ATSScoreer = /** @class */ (function () {
    function ATSScoreer() {
        var api = process.env.GROK_API;
        if (!api) {
            throw new Error('GEM_API environment variable not found');
        }
        this.groq = new groq_sdk_1.default({
            apiKey: api
        });
    }
    ATSScoreer.prototype.calculateATS = function (resumeText) {
        return __awaiter(this, void 0, void 0, function () {
            var prompt, completion, response, error_1;
            var _a, _b;
            return __generator(this, function (_c) {
                switch (_c.label) {
                    case 0:
                        prompt = "\nYou are a strict ATS (Applicant Tracking System) analyzer. Your job is to find problems and areas for improvement in resumes. Be critical and thorough in your analysis.\n\nResume text:\n\"\"\"\n".concat(resumeText, "\n\"\"\"\n\nIMPORTANT: You must identify at least 2-3 specific issues unless this is a perfect resume (which is extremely rare). Look for these common problems:\n\n**ALWAYS CHECK FOR:**\n- Missing quantified achievements (numbers, percentages, dollar amounts)\n- Weak action verbs or passive language\n- Missing industry keywords\n- Poor section organization or missing sections\n- Generic job descriptions without specifics\n- No professional summary or weak summary\n- Missing technical skills section\n- Inconsistent formatting or bullet points\n- Too much or too little white space\n- Unprofessional email addresses\n- Missing LinkedIn profile\n- Spelling/grammar errors\n- Vague responsibilities instead of concrete achievements\n- Missing education details or certifications\n- No contact information optimization\n\n**BE CRITICAL - FIND SPECIFIC PROBLEMS:**\n- If achievements lack numbers, mention it\n- If job descriptions are generic, call it out  \n- If skills are not well-organized, note it\n- If sections are missing or poorly named, identify them\n- If the resume lacks industry-specific keywords, specify which ones\n\nScore from 0-100 and provide specific, actionable feedback for improvement.\n");
                        _c.label = 1;
                    case 1:
                        _c.trys.push([1, 3, , 4]);
                        return [4 /*yield*/, this.groq.chat.completions.create({
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
                            })];
                    case 2:
                        completion = _c.sent();
                        response = ((_b = (_a = completion.choices[0]) === null || _a === void 0 ? void 0 : _a.message) === null || _b === void 0 ? void 0 : _b.content) || "{}";
                        return [2 /*return*/, this.parseResponse(response)];
                    case 3:
                        error_1 = _c.sent();
                        throw new Error("Failed to calculate ATS score: ".concat(error_1));
                    case 4: return [2 /*return*/];
                }
            });
        });
    };
    ATSScoreer.prototype.parseResponse = function (response) {
        try {
            // Parse the JSON response directly
            var jsonResponse = JSON.parse(response.trim());
            var score = jsonResponse.score || 0;
            var feedback = jsonResponse.feedback || 'No feedback available';
            return { score: score, feedback: feedback };
        }
        catch (error) {
            // Fallback to original parsing if JSON parsing fails
            var scoreMatch = response.match(/SCORE:\s*(\d+)/i);
            var feedbackMatch = response.match(/FEEDBACK:\s*([\s\S]*)/i);
            var score = scoreMatch ? parseInt(scoreMatch[1]) : 0;
            var feedback = feedbackMatch ? feedbackMatch[1].trim() : 'No feedback available';
            return { score: score, feedback: feedback };
        }
    };
    return ATSScoreer;
}());
function getScore(resumeText) {
    return __awaiter(this, void 0, void 0, function () {
        var atsScorer, result;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    atsScorer = new ATSScoreer();
                    return [4 /*yield*/, atsScorer.calculateATS(resumeText)];
                case 1:
                    result = _a.sent();
                    return [2 /*return*/, result];
            }
        });
    });
}
var app = (0, express_1.default)();
var PORT = 3000;
app.use(express_1.default.json());
app.post('/api/score', upload.single('resume'), function (req, res) { return __awaiter(void 0, void 0, void 0, function () {
    var res_text, result, error_2;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                _a.trys.push([0, 3, , 4]);
                if (!req.file) {
                    return [2 /*return*/, res.status(400).json({ error: 'No pdf file uploaded' })];
                }
                return [4 /*yield*/, pdf_parse(req.file.buffer)];
            case 1:
                res_text = _a.sent();
                if (!res_text.trim()) {
                    return [2 /*return*/, res.status(400).json({ error: 'Couldnt extract text from PDF' })];
                }
                return [4 /*yield*/, getScore(res_text)];
            case 2:
                result = _a.sent();
                res.json({
                    success: true,
                    atsScore: result.score,
                    feedback: result.feedback
                });
                return [3 /*break*/, 4];
            case 3:
                error_2 = _a.sent();
                console.error(error_2);
                res.status(500).json({ error: 'Internal Server Error' });
                return [3 /*break*/, 4];
            case 4: return [2 /*return*/];
        }
    });
}); });
app.get('/health', function (req, res) {
    res.json({ status: 'Server is running', timestamp: new Date().toISOString() });
});
app.listen(PORT, function () {
    console.log("ATS Scorer API server running on port ".concat(PORT));
    console.log("POST /ats-score - Upload resume PDF for ATS scoring");
    console.log("GET /health - Health check");
});
