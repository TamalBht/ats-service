import { Pinecone } from "@pinecone-database/pinecone";
import * as dotenv from 'dotenv';
import { GoogleGenerativeAI } from '@google/generative-ai';
import * as fs from 'fs';
const csvParser = require('csv-parser');

dotenv.config();


const pc = new Pinecone(
    {
        apiKey: process.env.PINE_API
    }
);  
const genAI = new GoogleGenerativeAI(process.env.GEM_API);
async function createEmbed(text) {
    try {
        const model = genAI.getGenerativeModel({ model: "embedding-001" });
        const res = await model.embedContent(text);
        return res.embedding;
    }
    catch (error) {
        console.log(error);
    }   
}

