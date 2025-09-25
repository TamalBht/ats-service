import { Pinecone } from "@pinecone-database/pinecone";
import * as dotenv from 'dotenv';
dotenv.config();
const pc = new Pinecone({
    apiKey: process.env.PINE_API
});
async function pine_upload(indexName, id, res, substring) {
    try {
        const indName = indexName || "ats-embed";
        const index = pc.Index(indName);
        var n = Math.random();
        const idd = id || `pdf-chunk-${n}`;
        await index.upsert([
            {
                id: idd,
                values: res.values,
                metadata: {
                    content: substring
                }
            }
        ]);
        console.log(`Upload to pinecone is successfull with id : ${idd}`);
    }
    catch (error) {
        console.error(error);
    }
}
export default pine_upload;
