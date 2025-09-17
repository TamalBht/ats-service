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
var generative_ai_1 = require("@google/generative-ai");
dotenv.config();
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
var ATSScoreer = /** @class */ (function () {
    function ATSScoreer() {
        var api = process.env.GEM_API;
        if (!api) {
            throw new Error('GEM_API environment variable not found');
        }
        this.genAI = new generative_ai_1.GoogleGenerativeAI(api);
    }
    ATSScoreer.prototype.calculateATS = function (resumeText) {
        return __awaiter(this, void 0, void 0, function () {
            var model, prompt, result, response, error_1;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        model = this.genAI.getGenerativeModel({ model: "gemini-2.5-flash" });
                        prompt = "\nAnalyze this resume text and give it an ATS (Applicant Tracking System) score from 0 to 100.\n\nResume text:\n\"\"\"\n".concat(resumeText, "\n\"\"\"\n\nPlease respond in this exact format:\nSCORE: [number from 0-100]\nFEEDBACK: [brief feedback about what's good and what needs improvement]\n");
                        _a.label = 1;
                    case 1:
                        _a.trys.push([1, 3, , 4]);
                        return [4 /*yield*/, model.generateContent(prompt)];
                    case 2:
                        result = _a.sent();
                        response = result.response.text();
                        return [2 /*return*/, this.parseResponse(response)];
                    case 3:
                        error_1 = _a.sent();
                        throw new Error("Failed to calculate ATS score: ".concat(error_1));
                    case 4: return [2 /*return*/];
                }
            });
        });
    };
    ATSScoreer.prototype.parseResponse = function (response) {
        var scoreMatch = response.match(/SCORE:\s*(\d+)/i);
        var feedbackMatch = response.match(/FEEDBACK:\s*(.*)/i);
        var score = scoreMatch ? parseInt(scoreMatch[1]) : 0;
        var feedback = feedbackMatch ? feedbackMatch[1].trim() : 'No feedback available';
        return { score: score, feedback: feedback };
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
function main() {
    return __awaiter(this, void 0, void 0, function () {
        var text, result, error_2;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    _a.trys.push([0, 3, , 4]);
                    return [4 /*yield*/, pdf_text("./docs/Tamal Bhattacharjee.pdf")];
                case 1:
                    text = _a.sent();
                    return [4 /*yield*/, getScore(text)];
                case 2:
                    result = _a.sent();
                    console.log("ATS Score:", result.score);
                    console.log("Feedback:", result.feedback);
                    return [3 /*break*/, 4];
                case 3:
                    error_2 = _a.sent();
                    console.error("Error:", error_2.message);
                    return [3 /*break*/, 4];
                case 4: return [2 /*return*/];
            }
        });
    });
}
main();
