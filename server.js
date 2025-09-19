import * as dotenv from "dotenv";
const { express } = require("express");
const { v2: cloudinary } = require('cloudinary');
const cors = require('cors');
import { GoogleGenerativeAI } from '@google/generative-ai';
//response comes as pdf --- parsed to text --using gemini ats score created--for recommendation and mistakes rag is used where the fileds already present in it is used to create a better context
dotenv.config();
const gem_api = `${process.env.GEM_API}`;
const genAI = new GoogleGenerativeAI(gem_api);
const app = express();
// Cloudinary Configuration
cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
    secure: true,
});
app.use(cors());
app.use(express.json());
