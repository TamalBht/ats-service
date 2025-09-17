import * as dotenv from 'dotenv';
import { GoogleGenerativeAI } from '@google/generative-ai';
dotenv.config();
const api=process.env.GEM_API;
const genAI=new GoogleGenerativeAI(api);
async function testAI(){
    const model=genAI.getGenerativeModel({model:"gemini-2.5-pro"});
    const prompt="Write a short poem about AI in 4 lines."; 
    try{
        const result=await model.generateContent(prompt);
        console.log(result.response.text());
    }catch(error){
        console.log(error);
    }   
}
testAI();