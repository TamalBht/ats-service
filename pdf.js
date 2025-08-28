"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var pdf_1 = require("@langchain/community/document_loaders/fs/pdf");
var pdfPath = "./docs/story.pdf";
var loader = new pdf_1.PDFLoader(pdfPath);
loader.load().then(function (docs) {
    console.log(docs);
});
