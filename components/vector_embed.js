import * as dotenv from 'dotenv';
dotenv.config();
import { GoogleGenerativeAI } from '@google/generative-ai';
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
//driver function
async function main() {
    const text = "Hello I am Tamal";
    try {
        const embedd = await createEmbed(text);
        console.log(embedd.values);
    }
    catch (error) {
        console.log(error);
    }
}
export default createEmbed;
