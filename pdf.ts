import { PDFLoader } from "@langchain/community/document_loaders/fs/pdf";
const pdfPath="./docs/story.pdf"
const loader = new PDFLoader(pdfPath)
loader.load().then(docs=>{
    
    console.log(docs)
})