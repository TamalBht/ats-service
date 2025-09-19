import { Pinecone } from "@pinecone-database/pinecone";
import * as dotenv from 'dotenv';
import { GoogleGenerativeAI } from '@google/generative-ai';
import * as fs from 'fs';
const csvParser = require('csv-parser');
dotenv.config();
const pine_api = `${process.env.PINE_API}`;
const pc = new Pinecone({
    apiKey: pine_api
});
const genAI = new GoogleGenerativeAI(process.env.GEM_API);
async function createEmbed(text) {
    try {
        const model = genAI.getGenerativeModel({ model: "embedding-001" });
        const res = await model.embedContent(text);
        return res.embedding;
    }
    catch (error) {
        console.log('Embedding error:', error);
        return null;
    }
}
async function clearPineconeIndex(index) {
    try {
        console.log('Clearing entire Pinecone index...');
        // Delete all vectors by using deleteAll
        await index.deleteAll();
        console.log('Successfully cleared all vectors from the index');
        // Wait a bit for the deletion to propagate
        await new Promise(resolve => setTimeout(resolve, 2000));
    }
    catch (error) {
        console.log('Error clearing index:', error);
        throw error;
    }
}
async function loadCSVData(filePath) {
    return new Promise((resolve, reject) => {
        const data = [];
        fs.createReadStream(filePath)
            .pipe(csvParser())
            .on('data', (row) => {
            // Only process rows that have both title and description
            if (row.title && row.description) {
                const title = row.title.trim();
                const description = row.description.trim();
                // Filter for records containing 'developer' (case-insensitive)
                const containsDeveloper = title.toLowerCase().includes('developer') ||
                    description.toLowerCase().includes('developer');
                if (containsDeveloper) {
                    data.push({
                        title: title,
                        description: description
                    });
                }
            }
        })
            .on('end', () => {
            console.log(`Loaded ${data.length} developer-related records from CSV`);
            resolve(data);
        })
            .on('error', (error) => {
            reject(error);
        });
    });
}
function createBatches(data, batchSize) {
    const batches = [];
    for (let i = 0; i < data.length; i += batchSize) {
        batches.push(data.slice(i, i + batchSize));
    }
    return batches;
}
async function processBatch(batch, index, startId) {
    const vectors = [];
    for (let i = 0; i < batch.length; i++) {
        const item = batch[i];
        // Combine title and description for embedding
        const combinedText = `${item.title} ${item.description}`;
        console.log(`Processing developer item ${startId + i + 1}: ${item.title.substring(0, 50)}...`);
        const embedding = await createEmbed(combinedText);
        if (embedding && embedding.values) {
            vectors.push({
                id: `dev_${startId + i + 1}`,
                values: embedding.values,
                metadata: {
                    title: item.title,
                    description: item.description,
                    source: 'csv_developer_dataset'
                }
            });
        }
        else {
            console.log(`Failed to create embedding for developer item ${startId + i + 1}`);
        }
        // Add small delay to avoid rate limiting
        await new Promise(resolve => setTimeout(resolve, 100));
    }
    if (vectors.length > 0) {
        try {
            await index.upsert(vectors);
            console.log(`Successfully uploaded batch of ${vectors.length} developer vectors`);
        }
        catch (error) {
            console.log('Batch upload error:', error);
        }
    }
    return vectors.length;
}
async function main() {
    try {
        // Configuration
        const csvFilePath = './docs/postings.csv'; // Replace with your CSV file path
        const indexName = 'ats-embed';
        const batchSize = 10; // Adjust batch size as needed
        // Get Pinecone index
        const index = pc.Index(indexName);
        // Step 1: Clear the entire database
        await clearPineconeIndex(index);
        // Step 2: Load CSV data (filtered for developer records only)
        console.log('\nLoading and filtering CSV data for developer records...');
        const csvData = await loadCSVData(csvFilePath);
        if (csvData.length === 0) {
            console.log('No developer-related records found in CSV file');
            return;
        }
        console.log(`Found ${csvData.length} developer-related records to process`);
        // Create batches
        const batches = createBatches(csvData, batchSize);
        console.log(`Created ${batches.length} batches of size ${batchSize}`);
        // Process each batch
        let totalUploaded = 0;
        for (let batchIndex = 0; batchIndex < batches.length; batchIndex++) {
            for (let batchIndex = 99; batchIndex < batches.length; batchIndex++) {
                const batch = batches[batchIndex];
                const startId = batchIndex * batchSize;
                console.log(`\nProcessing developer batch ${batchIndex + 1}/${batches.length}...`);
                const uploadedCount = await processBatch(batch, index, startId);
                totalUploaded += uploadedCount;
                // Add delay between batches to avoid rate limiting
                if (batchIndex < batches.length - 1) {
                    console.log('Waiting before next batch...');
                    await new Promise(resolve => setTimeout(resolve, 1000));
                }
            }
            console.log(`\nCompleted! Total developer vectors uploaded: ${totalUploaded}`);
        }
        try { }
        catch (error) {
            console.log('Main function error:', error);
        }
    }
    finally {
    }
    main();
}
