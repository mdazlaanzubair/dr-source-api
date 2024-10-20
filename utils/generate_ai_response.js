const { GoogleGenerativeAI, SchemaType } = require("@google/generative-ai");
const { configDotenv } = require("dotenv");

configDotenv();

async function generateAIResponse(context, question, api_key) {
  // INITIALIZING GEMINI AI SDK
  // INITIALIZE THE AI MODEL WITH API KEY
  const genAI = new GoogleGenerativeAI(api_key);

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

  try {
    // GENERATE THE CONTENT BASED ON THE PROMPT
    // Construct the RAG prompt
    const prompt = `
                    You are a highly knowledgeable assistant tasked with answering questions based on provided documents. 
                    Your goal is to accurately retrieve the most relevant information from the documents, ensuring precision 
                    and clarity in your response. If the query is vague or ambiguous, provide clarification or ask for more details. 
                    If there is conflicting information in the documents, provide both perspectives with an explanation.
                    
                    Use the following guidelines when responding:
                    1. Base your answers strictly on the information retrieved from the documents.
                    2. Provide detailed, long, clear and descriptive responses, and ensuring factual accuracy.
                    3. If multiple relevant sections are found, summarize them effectively, maintaining context.
                    4. Include direct references to document sections or page numbers when applicable.
                    5. Try to give response in markdown so that it can be rendered in UI for better readability.

                    ### Query:
                    ${question}

                    ### Retrieved Documents:
                    ${context.join("\n")}

                    ### Answer:
                  `;

    const result = await genAIModel.generateContent(prompt, {
      temperature: 0.5,
    });

    return JSON.parse(result?.response?.text())?.reply;
  } catch (error) {
    console.log("##########################");
    console.log("Error while generating AI response:\n", error);
    console.log("##########################");
    throw new Error("Failed to generate AI response");
  }
}

module.exports = { generateAIResponse };
