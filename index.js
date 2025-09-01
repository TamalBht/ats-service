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
var pinecone_1 = require("@pinecone-database/pinecone");
var dotenv = require("dotenv");
var generative_ai_1 = require("@google/generative-ai");
var pdf_1 = require("@langchain/community/document_loaders/fs/pdf");
dotenv.config();
var pine_api = "".concat(process.env.PINE_API);
var pc = new pinecone_1.Pinecone({
    apiKey: pine_api
});
var genAI = new generative_ai_1.GoogleGenerativeAI(process.env.GEM_API);
function createEmbed(text) {
    return __awaiter(this, void 0, void 0, function () {
        var model, res, error_1;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    _a.trys.push([0, 2, , 3]);
                    model = genAI.getGenerativeModel({ model: "embedding-001" });
                    return [4 /*yield*/, model.embedContent(text)];
                case 1:
                    res = _a.sent();
                    return [2 /*return*/, res.embedding];
                case 2:
                    error_1 = _a.sent();
                    console.log(error_1);
                    return [3 /*break*/, 3];
                case 3: return [2 /*return*/];
            }
        });
    });
}
function testGet(queryText) {
    return __awaiter(this, void 0, void 0, function () {
        var queryEmbed, index, searchResult, dataa_r, similar, model, prompt_1, result, error_2;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    _a.trys.push([0, 4, , 5]);
                    return [4 /*yield*/, createEmbed(queryText)];
                case 1:
                    queryEmbed = _a.sent();
                    index = pc.index("gemini-embed-765");
                    return [4 /*yield*/, index.query({
                            vector: queryEmbed.values,
                            topK: 1,
                            includeMetadata: true
                        })];
                case 2:
                    searchResult = _a.sent();
                    if (searchResult.matches.length === 0)
                        return [2 /*return*/, "No match found"];
                    dataa_r = searchResult.matches[0].metadata.text || "Couldnt get the content";
                    similar = searchResult.matches[0].score;
                    model = genAI.getGenerativeModel({ model: 'gemini-2.0-flash' });
                    prompt_1 = "Based on this content from a PDF document:\n\n\"".concat(dataa_r, "\"\n\nUser Question: ").concat(queryText, "\n\nPlease answer the user's question using the provided content. If the content doesn't contain relevant information, say so clearly.");
                    return [4 /*yield*/, model.generateContent(prompt_1)];
                case 3:
                    result = _a.sent();
                    return [2 /*return*/, result.response.text()];
                case 4:
                    error_2 = _a.sent();
                    console.log(error_2);
                    return [3 /*break*/, 5];
                case 5: return [2 /*return*/];
            }
        });
    });
}
function main() {
    return __awaiter(this, void 0, void 0, function () {
        var pdfPath, loader, docs, textt, res, indexName, index, questions, _i, questions_1, question, answer;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    pdfPath = "./docs/story.pdf";
                    loader = new pdf_1.PDFLoader(pdfPath);
                    return [4 /*yield*/, loader.load()];
                case 1:
                    docs = _a.sent();
                    textt = docs[0].pageContent;
                    return [4 /*yield*/, createEmbed(textt)];
                case 2:
                    res = _a.sent();
                    console.log("Embeddings created scuccesfully");
                    indexName = 'gemini-embed-765';
                    return [4 /*yield*/, pc.createIndex({
                            name: indexName,
                            dimension: 768, // Match Gemini's dimension
                            metric: 'cosine',
                            spec: {
                                serverless: {
                                    cloud: 'aws',
                                    region: 'us-east-1'
                                }
                            }
                        })];
                case 3:
                    _a.sent();
                    // After pc.createIndex, add:
                    console.log("Waiting for index to be ready...");
                    return [4 /*yield*/, new Promise(function (resolve) { return setTimeout(resolve, 6000); })];
                case 4:
                    _a.sent(); // Wait 10 seconds
                    index = pc.Index(indexName);
                    return [4 /*yield*/, index.upsert([
                            {
                                id: 'pdf-chunk-1',
                                values: res.values,
                                metadata: {
                                    source: 'story.pdf',
                                    text: textt.substring(0, 1000)
                                }
                            }
                        ])];
                case 5:
                    _a.sent();
                    console.log("Sent to pinecone successfully");
                    console.log("Testing the data");
                    questions = [
                        "What is this story about?",
                        "Who are the main characters?",
                        "What happens in the beginning?",
                        "Tell me about the plot"
                    ];
                    _i = 0, questions_1 = questions;
                    _a.label = 6;
                case 6:
                    if (!(_i < questions_1.length)) return [3 /*break*/, 9];
                    question = questions_1[_i];
                    console.log("\nQuestion: ".concat(question));
                    return [4 /*yield*/, testGet(question)];
                case 7:
                    answer = _a.sent();
                    console.log("Gemini's Answer: ".concat(answer, "\n"));
                    _a.label = 8;
                case 8:
                    _i++;
                    return [3 /*break*/, 6];
                case 9: return [2 /*return*/];
            }
        });
    });
}
main();
