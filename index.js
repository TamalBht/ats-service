"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var pinecone_1 = require("@pinecone-database/pinecone");
var dotenv = require("dotenv");
dotenv.config();
var pine_api = "".concat(process.env.PINE_API);
var pc = new pinecone_1.Pinecone({
    apiKey: pine_api
});
var indexName = 'developer-quickstart-js';
pc.createIndexForModel({
    name: indexName,
    cloud: 'aws',
    region: 'us-east-1',
    embed: {
        model: 'llama-text-embed-v2',
        fieldMap: { text: 'chunk_text' },
    },
    waitUntilReady: true,
});
