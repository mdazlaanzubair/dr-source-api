const { initGenAI } = require("./init_gen_ai");

// INITIALIZING GEMINI AI SDK
async function generateAIResponse(context, question) {
  try {
    // INITIALIZING GEN_AI INSTANCE
    const genAIModel = initGenAI();

    // GENERATE THE CONTENT BASED ON THE PROMPT
    const result = await genAIModel.generateContent(
      ` You are an AI assistant and good in finding answers from the given context
        Answer the question as detailed as possible from the provided context. 
        Make sure to provide all the details. If the answer is not in the provided 
        context, just say "Answer is not available in the context." Don't provide 
        a wrong answer.
  
        Context:
        ${context}
  
        Question:
        ${question}
  
        Answer:
      `
    );

    console.log();
    console.log(result?.response?.text());
    console.log();

    return JSON.parse(result?.response?.text())?.reply;
  } catch (error) {
    console.error("Error =========>", error);
    throw new Error("Failed to generate AI response");
  }
}

module.exports = { generateAIResponse };
