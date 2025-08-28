import { Pinecone } from "@pinecone-database/pinecone";
import * as dotenv from 'dotenv';
import { PDFLoader } from "@langchain/community/document_loaders/fs/pdf";
dotenv.config()
const pine_api=`${process.env.PINE_API}`;
const pc = new Pinecone(
    {
        apiKey:pine_api
    }
);

const indexName = 'developer-quickstart-js';
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