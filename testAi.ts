import { ChatGroq } from "@langchain/groq";
import * as dotenv from "dotenv"
dotenv.config();

async function askGrok() {
  // Initialize the Grok model
  const model = new ChatGroq({
    apiKey: process.env.GROK_API,
    model: "llama-3.3-70b-versatile"
  });

  // Predefined question
  const question = "What is the capital of France?";

  try {
    // Ask the question and get response
    const response = await model.invoke(question);
    
    // Log the answer
    console.log("Question:", question);
    console.log("Answer:", response.content);
    
  } catch (error) {
    console.error("Error:", error);
  }
}

// Run the function
askGrok();