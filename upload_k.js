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
var fs = require("fs");
var csvParser = require('csv-parser');
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
                    console.log('Embedding error:', error_1);
                    return [2 /*return*/, null];
                case 3: return [2 /*return*/];
            }
        });
    });
}
function clearPineconeIndex(index) {
    return __awaiter(this, void 0, void 0, function () {
        var error_2;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    _a.trys.push([0, 3, , 4]);
                    console.log('Clearing entire Pinecone index...');
                    // Delete all vectors by using deleteAll
                    return [4 /*yield*/, index.deleteAll()];
                case 1:
                    // Delete all vectors by using deleteAll
                    _a.sent();
                    console.log('Successfully cleared all vectors from the index');
                    // Wait a bit for the deletion to propagate
                    return [4 /*yield*/, new Promise(function (resolve) { return setTimeout(resolve, 2000); })];
                case 2:
                    // Wait a bit for the deletion to propagate
                    _a.sent();
                    return [3 /*break*/, 4];
                case 3:
                    error_2 = _a.sent();
                    console.log('Error clearing index:', error_2);
                    throw error_2;
                case 4: return [2 /*return*/];
            }
        });
    });
}
function loadCSVData(filePath) {
    return __awaiter(this, void 0, void 0, function () {
        return __generator(this, function (_a) {
            return [2 /*return*/, new Promise(function (resolve, reject) {
                    var data = [];
                    fs.createReadStream(filePath)
                        .pipe(csvParser())
                        .on('data', function (row) {
                        // Only process rows that have both title and description
                        if (row.title && row.description) {
                            var title = row.title.trim();
                            var description = row.description.trim();
                            // Filter for records containing 'developer' (case-insensitive)
                            var containsDeveloper = title.toLowerCase().includes('developer') ||
                                description.toLowerCase().includes('developer');
                            if (containsDeveloper) {
                                data.push({
                                    title: title,
                                    description: description
                                });
                            }
                        }
                    })
                        .on('end', function () {
                        console.log("Loaded ".concat(data.length, " developer-related records from CSV"));
                        resolve(data);
                    })
                        .on('error', function (error) {
                        reject(error);
                    });
                })];
        });
    });
}
function createBatches(data, batchSize) {
    var batches = [];
    for (var i = 0; i < data.length; i += batchSize) {
        batches.push(data.slice(i, i + batchSize));
    }
    return batches;
}
function processBatch(batch, index, startId) {
    return __awaiter(this, void 0, void 0, function () {
        var vectors, i, item, combinedText, embedding, error_3;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    vectors = [];
                    i = 0;
                    _a.label = 1;
                case 1:
                    if (!(i < batch.length)) return [3 /*break*/, 5];
                    item = batch[i];
                    combinedText = "".concat(item.title, " ").concat(item.description);
                    console.log("Processing developer item ".concat(startId + i + 1, ": ").concat(item.title.substring(0, 50), "..."));
                    return [4 /*yield*/, createEmbed(combinedText)];
                case 2:
                    embedding = _a.sent();
                    if (embedding && embedding.values) {
                        vectors.push({
                            id: "dev_".concat(startId + i + 1),
                            values: embedding.values,
                            metadata: {
                                title: item.title,
                                description: item.description,
                                source: 'csv_developer_dataset'
                            }
                        });
                    }
                    else {
                        console.log("Failed to create embedding for developer item ".concat(startId + i + 1));
                    }
                    // Add small delay to avoid rate limiting
                    return [4 /*yield*/, new Promise(function (resolve) { return setTimeout(resolve, 100); })];
                case 3:
                    // Add small delay to avoid rate limiting
                    _a.sent();
                    _a.label = 4;
                case 4:
                    i++;
                    return [3 /*break*/, 1];
                case 5:
                    if (!(vectors.length > 0)) return [3 /*break*/, 9];
                    _a.label = 6;
                case 6:
                    _a.trys.push([6, 8, , 9]);
                    return [4 /*yield*/, index.upsert(vectors)];
                case 7:
                    _a.sent();
                    console.log("Successfully uploaded batch of ".concat(vectors.length, " developer vectors"));
                    return [3 /*break*/, 9];
                case 8:
                    error_3 = _a.sent();
                    console.log('Batch upload error:', error_3);
                    return [3 /*break*/, 9];
                case 9: return [2 /*return*/, vectors.length];
            }
        });
    });
}
function main() {
    return __awaiter(this, void 0, void 0, function () {
        var csvFilePath, indexName, batchSize, index, csvData, batches, totalUploaded, batchIndex, batch, startId, uploadedCount, error_4;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    _a.trys.push([0, 7, , 8]);
                    csvFilePath = './docs/postings.csv';
                    indexName = 'ats-embed';
                    batchSize = 10;
                    index = pc.Index(indexName);
                    // Step 1: Clear the entire database
                    // Step 2: Load CSV data (filtered for developer records only)
                    console.log('\nLoading and filtering CSV data for developer records...');
                    return [4 /*yield*/, loadCSVData(csvFilePath)];
                case 1:
                    csvData = _a.sent();
                    if (csvData.length === 0) {
                        console.log('No developer-related records found in CSV file');
                        return [2 /*return*/];
                    }
                    console.log("Found ".concat(csvData.length, " developer-related records to process"));
                    batches = createBatches(csvData, batchSize);
                    console.log("Created ".concat(batches.length, " batches of size ").concat(batchSize));
                    totalUploaded = 0;
                    batchIndex = 99;
                    _a.label = 2;
                case 2:
                    if (!(batchIndex < batches.length)) return [3 /*break*/, 6];
                    batch = batches[batchIndex];
                    startId = batchIndex * batchSize;
                    console.log("\nProcessing developer batch ".concat(batchIndex + 1, "/").concat(batches.length, "..."));
                    return [4 /*yield*/, processBatch(batch, index, startId)];
                case 3:
                    uploadedCount = _a.sent();
                    totalUploaded += uploadedCount;
                    if (!(batchIndex < batches.length - 1)) return [3 /*break*/, 5];
                    console.log('Waiting before next batch...');
                    return [4 /*yield*/, new Promise(function (resolve) { return setTimeout(resolve, 1000); })];
                case 4:
                    _a.sent();
                    _a.label = 5;
                case 5:
                    batchIndex++;
                    return [3 /*break*/, 2];
                case 6:
                    console.log("\nCompleted! Total developer vectors uploaded: ".concat(totalUploaded));
                    return [3 /*break*/, 8];
                case 7:
                    error_4 = _a.sent();
                    console.log('Main function error:', error_4);
                    return [3 /*break*/, 8];
                case 8: return [2 /*return*/];
            }
        });
    });
}
main();
