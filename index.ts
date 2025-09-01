import { Pinecone } from "@pinecone-database/pinecone";
import * as dotenv from 'dotenv';

import {GoogleGenerativeAI}from '@google/generative-ai'

import { PDFLoader } from "@langchain/community/document_loaders/fs/pdf";
import { text } from "stream/consumers";
dotenv.config();
const pine_api=`${process.env.PINE_API}`;
const pc = new Pinecone(
    {
        apiKey:pine_api
    }
);

const genAI=new GoogleGenerativeAI(process.env.GEM_API);
async function createEmbed(text){
    try{
        const model = genAI.getGenerativeModel({model:"embedding-001"});
        const res=await model.embedContent(text);
        return res.embedding;
    }
    catch(error){
        console.log(error);
    }

}

async function main(){
  //loading the file path
    const pdfPath="./docs/story.pdf"
    //new obj to load the pdf
const loader = new PDFLoader(pdfPath)
//converting to text
const docs=await loader.load();
//storing it
var textt=docs[0].pageContent;
//creating embeddings
var res = await createEmbed(textt);
console.log("Embeddings created scuccesfully");

//sending to pinecone
const indexName = 'gemini-embed-765';
await pc.createIndex({
  name: indexName,
  dimension: 768, // Match Gemini's dimension
  metric: 'cosine',
  spec: {
    serverless: {
      cloud: 'aws',
      region: 'us-east-1'
    }
  }
});
// After pc.createIndex, add:
console.log("Waiting for index to be ready...");
await new Promise(resolve => setTimeout(resolve, 6000)); // Wait 10 seconds
//creating index
const index=pc.Index(indexName);
await index.upsert([
  {
    id:'pdf-chunk-1',
    values:res.values,
    metadata:{
      source:'story.pdf',
      text:textt.substring(0,1000)
    }
  }
]);
console.log("Sent to pinecone successfully");
}
main();
