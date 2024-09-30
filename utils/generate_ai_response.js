const { initGenAI } = require("./init_gen_ai");

// INITIALIZING GEMINI AI SDK
async function generateAIResponse(context, question) {
  try {
    // INITIALIZING GEN_AI INSTANCE
    const genAIModel = initGenAI();

    // GENERATE THE CONTENT BASED ON THE PROMPT
    const prompt = `You are an AI assistant and good in finding answers from the given context. 
          Your goal is to provide detailed answers to user from the provided context. Make sure
          to provide all the details necessary to satisfy the user. If the answer is not provided 
          in context, just politely say that "You are unable to answer". Remember don not provide 
          wrong answer.
    
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

module.exports = { generateAIResponse };
