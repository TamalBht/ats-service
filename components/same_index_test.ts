import { Pinecone } from "@pinecone-database/pinecone";
import * as dotenv from 'dotenv';

import {GoogleGenerativeAI}from '@google/generative-ai'

import { PDFLoader } from "@langchain/community/document_loaders/fs/pdf";
import { text } from "stream/consumers";
import { error } from "console";
dotenv.config();
const pine_api=`${process.env.PINE_API}`;
const pc = new Pinecone(
    {
        apiKey:pine_api
    }
);
const genAI=new GoogleGenerativeAI(process.env.GEM_API);
interface QueryResult{
    answer:string;
    relevantChunkIds:string[];
    similarityScores: number[];
    confidence:number;
    
}
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
//to handle query
async function answerQuery(
    query:string,
    indexName:string='gemini-embed-768',
    options:{
        topK?:number;
        scoreThreshold?:number;
    }
): Promise<QueryResult>{
    const {topK=5,scoreThreshold=0.7}=options;
    const q_embed=await createEmbed(query)
    if(!q_embed) throw new error("Failed to embed");
    const index= pc.Index(indexName);
    //search in pinecone
    const search_res=await index.query({
        vector:q_embed.values,
        topK:topK,
        includeMetadata:true,
        includeValues:false
    });
    //filter the score threshhold and extract text
    const q_match=search_res.matches?.filter(
        match=>match.score && match.score>=scoreThreshold
    ) || [];
    if(q_match.length===0){
        return{
            answer:"Couldnt find anything",
            relevantChunkIds:[],
            similarityScores:[],
            confidence:0,
            

        };
    }
    //to store the content for each relevant match
    const chunkIds=q_match.map(match=>match.id);
    const scores=q_match.map(match=>match.score || 0);
    const avgScore=scores.reduce((sum,score)=>sum+score,0)/scores.length;
    const maxScore=Math.max(...scores);
    const prompt=`

QUERY: "${query}"

SEARCH RESULTS:
- ${q_match.length} semantically similar sections found
- Similarity scores: ${scores.map(s => s.toFixed(3)).join(', ')}
- Average similarity: ${avgScore.toFixed(3)}
- Highest similarity: ${maxScore.toFixed(3)}
- Related chunk IDs: ${chunkIds.join(', ')}







Keep the response conversational and helpful for someone asking about a story.`


const model=genAI.getGenerativeModel({model:"gemini-1.5-flash"});
const result=await model.generateContent(prompt);
const response=await result.response;
const answer=response.text();
return{
    answer,
    relevantChunkIds:chunkIds,
    similarityScores:scores,
    confidence:avgScore,
}

}


async function main(){
    const second_path="./docs/time_traveler_story.pdf";
    const loader=new PDFLoader(second_path);
    //loading text
    const docs=await loader.load();
    //storing text
    var textt = docs[0].pageContent;
    var res = createEmbed(textt);
    console.log("Embed successful")
    //sending to pinecone with indexName 'gemini-embed-768'(already exists)
    const indexName='gemini-embed-768';
    const index=pc.Index(indexName)
    await index.upsert([
        {
            id:'pdf-chunk-2',
            values:(await res).values,
            metadata:{
                source: "time_traveler.pdf"
            }
        }
    ])
    console.log("Sent to pinecone sucessfully");
}



async function  tester(){
    console.log("Testing it.....\n");
    const testQueries = [
        "What is this story about?",
        "Who is Arin?", 
        "What is the content of the data given to you",
        "What is the plot?",
        "Tell me about the ending"
    ];
    for(const query of testQueries){
        try{
             console.log(`\n${'='.repeat(50)}`);
            const result = await answerQuery(query, 'gemini-embed-768', {
                topK: 3,
                scoreThreshold: 0.5  // Lower threshold for testing
            });

            console.log(`📝 QUERY: ${query}`);
            console.log(`💬 ANSWER: ${result.answer}`);
            console.log(`🎯 Confidence: ${result.confidence.toFixed(3)}`);
            console.log(`📍 Relevant Chunks: ${result.relevantChunkIds.join(', ')}`);
            console.log(`📊 Scores: ${result.similarityScores.map(s => s.toFixed(3)).join(', ')}`);
            

        }
        catch(error){ console.error("error in testing")}
    }
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
