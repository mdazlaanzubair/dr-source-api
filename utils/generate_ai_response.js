import { GoogleGenerativeAI, SchemaType } from "@google/generative-ai";
import { configDotenv } from "dotenv";
configDotenv();

// INITIALIZING GEMINI AI SDK
// INITIALIZE THE AI MODEL WITH API KEY
const genAI = new GoogleGenerativeAI(process.env.GOOGLE_API_KEY);

// Define the generative model configuration
const genAIModel = genAI.getGenerativeModel({
  model: "gemini-1.5-flash", // Default to gemini-1.5-flash if no model is specified
  generationConfig: {
    responseMimeType: "application/json", // Expect a JSON response
    responseSchema: {
      type: SchemaType.OBJECT,
      properties: {
        reply: { type: SchemaType.STRING },
      },
    },
  },
});

export async function generateAIResponse(context, question) {
  try {
    // GENERATE THE CONTENT BASED ON THE PROMPT
    const prompt = `You are an AI assistant and good in finding answers from the given context. 
          Your goal is to provide detailed answers to user from the provided context. Make sure
          to provide all the details necessary to satisfy the user. If the answer is not provided 
          in context, just politely say that did not find to answer in the document. Remember do 
          not provide wrong answer.
    
          Context:
          ${context}
    
          Question:
          ${question}
    
          Answer:
        `;
    const result = await genAIModel.generateContent(prompt, {
      temperature: 0.3,
    });

    return JSON.parse(result?.response?.text())?.reply;
  } catch (error) {
    console.error("Error =========>", error);
    throw new Error("Failed to generate AI response");
  }
}
