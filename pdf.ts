import { PDFLoader } from "@langchain/community/document_loaders/fs/pdf";
import * as dotenv from "dotenv"
import {GoogleGenerativeAI}from '@google/generative-ai'
dotenv.config();
var textt;



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
async function pdf_embed(path){
    const pdfPath=`${path}`||"./docs/story.pdf"
const loader = new PDFLoader(pdfPath)
const docs=await loader.load();
textt=docs[0].pageContent;
var res = await createEmbed(textt);
console.log("Embeddings created sucessfully!");
}
 export default pdf_embed;
