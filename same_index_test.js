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
var console_1 = require("console");
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
//to handle query
function answerQuery(query_1) {
    return __awaiter(this, arguments, void 0, function (query, indexName, options) {
        var _a, topK, _b, scoreThreshold, q_embed, index, search_res, q_match, chunkIds, scores, avgScore, maxScore, prompt, model, result, response, answer;
        var _c;
        if (indexName === void 0) { indexName = 'gemini-embed-768'; }
        return __generator(this, function (_d) {
            switch (_d.label) {
                case 0:
                    _a = options.topK, topK = _a === void 0 ? 5 : _a, _b = options.scoreThreshold, scoreThreshold = _b === void 0 ? 0.7 : _b;
                    return [4 /*yield*/, createEmbed(query)];
                case 1:
                    q_embed = _d.sent();
                    if (!q_embed)
                        throw new console_1.error("Failed to embed");
                    index = pc.Index(indexName);
                    return [4 /*yield*/, index.query({
                            vector: q_embed.values,
                            topK: topK,
                            includeMetadata: true,
                            includeValues: false
                        })];
                case 2:
                    search_res = _d.sent();
                    q_match = ((_c = search_res.matches) === null || _c === void 0 ? void 0 : _c.filter(function (match) { return match.score && match.score >= scoreThreshold; })) || [];
                    if (q_match.length === 0) {
                        return [2 /*return*/, {
                                answer: "Couldnt find anything",
                                relevantChunkIds: [],
                                similarityScores: [],
                                confidence: 0,
                            }];
                    }
                    chunkIds = q_match.map(function (match) { return match.id; });
                    scores = q_match.map(function (match) { return match.score || 0; });
                    avgScore = scores.reduce(function (sum, score) { return sum + score; }, 0) / scores.length;
                    maxScore = Math.max.apply(Math, scores);
                    prompt = "Based on semantic similarity search in a story PDF document, analyze this query pattern:\n\nQUERY: \"".concat(query, "\"\n\nSEARCH RESULTS:\n- ").concat(q_match.length, " semantically similar sections found\n- Similarity scores: ").concat(scores.map(function (s) { return s.toFixed(3); }).join(', '), "\n- Average similarity: ").concat(avgScore.toFixed(3), "\n- Highest similarity: ").concat(maxScore.toFixed(3), "\n- Related chunk IDs: ").concat(chunkIds.join(', '), "\n\n\nTASK: Based on these similarity patterns, provide a helpful response about what the user is asking regarding the story. Consider:\n\n- High scores (>0.8): Very relevant story elements\n- Medium scores (0.6-0.8): Somewhat related themes  \n- Multiple high scores: Well-covered topic in the story\n- Single high score: Specific story element\n\nGenerate a response that:\n1. Acknowledges what aspects of the story seem most relevant to their query\n2. Explains the confidence level based on similarity scores\n3. Suggests what story elements or themes their query relates to\n4. Is honest about working with semantic similarity only (no direct text access)\n\nKeep the response conversational and helpful for someone asking about a story.");
                    model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
                    return [4 /*yield*/, model.generateContent(prompt)];
                case 3:
                    result = _d.sent();
                    return [4 /*yield*/, result.response];
                case 4:
                    response = _d.sent();
                    answer = response.text();
                    return [2 /*return*/, {
                            answer: answer,
                            relevantChunkIds: chunkIds,
                            similarityScores: scores,
                            confidence: avgScore,
                        }];
            }
        });
    });
}
function main() {
    return __awaiter(this, void 0, void 0, function () {
        var second_path, loader, docs, textt, res, indexName, index, _a, _b;
        var _c;
        return __generator(this, function (_d) {
            switch (_d.label) {
                case 0:
                    second_path = "./docs/time_traveler_story.pdf";
                    loader = new pdf_1.PDFLoader(second_path);
                    return [4 /*yield*/, loader.load()];
                case 1:
                    docs = _d.sent();
                    textt = docs[0].pageContent;
                    res = createEmbed(textt);
                    console.log("Embed successful");
                    indexName = 'gemini-embed-768';
                    index = pc.Index(indexName);
                    _b = (_a = index).upsert;
                    _c = {
                        id: 'pdf-chunk-2'
                    };
                    return [4 /*yield*/, res];
                case 2: return [4 /*yield*/, _b.apply(_a, [[
                            (_c.values = (_d.sent()).values,
                                _c.metadata = {
                                    source: "time_traveler.pdf"
                                },
                                _c)
                        ]])];
                case 3:
                    _d.sent();
                    console.log("Sent to pinecone sucessfully");
                    return [2 /*return*/];
            }
        });
    });
}
function tester() {
    return __awaiter(this, void 0, void 0, function () {
        var testQueries, _i, testQueries_1, query, result, error_2;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    console.log("Testing it.....\n");
                    testQueries = [
                        "What is this story about?",
                        "Who is Arin?",
                        "What is the plot?",
                        "Tell me about the ending"
                    ];
                    _i = 0, testQueries_1 = testQueries;
                    _a.label = 1;
                case 1:
                    if (!(_i < testQueries_1.length)) return [3 /*break*/, 6];
                    query = testQueries_1[_i];
                    _a.label = 2;
                case 2:
                    _a.trys.push([2, 4, , 5]);
                    console.log("\n".concat('='.repeat(50)));
                    return [4 /*yield*/, answerQuery(query, 'gemini-embed-768', {
                            topK: 3,
                            scoreThreshold: 0.5 // Lower threshold for testing
                        })];
                case 3:
                    result = _a.sent();
                    console.log("\uD83D\uDCDD QUERY: ".concat(query));
                    console.log("\uD83D\uDCAC ANSWER: ".concat(result.answer));
                    console.log("\uD83C\uDFAF Confidence: ".concat(result.confidence.toFixed(3)));
                    console.log("\uD83D\uDCCD Relevant Chunks: ".concat(result.relevantChunkIds.join(', ')));
                    console.log("\uD83D\uDCCA Scores: ".concat(result.similarityScores.map(function (s) { return s.toFixed(3); }).join(', ')));
                    return [3 /*break*/, 5];
                case 4:
                    error_2 = _a.sent();
                    console.error("error in testing");
                    return [3 /*break*/, 5];
                case 5:
                    _i++;
                    return [3 /*break*/, 1];
                case 6: return [2 /*return*/];
            }
        });
    });
}
tester();
// async function testGemAccess(){
//     try{
//         const indexName='gemini-embed-765';
//     const index=pc.Index(indexName);
//     const res = await index.fetch(['pdf-chunk-1']);
//     if(!res.records['pdf-chunk-1']) console.log("Couldnt fetch");
//     console.log(res.records['pdf-chunk-1'].metadata);
//     const data=res.records['pdf-chunk-1'];
//     }
//     catch(error){
//         console.log(error);
//     }
// }
// testGemAccess();
