const { GoogleGenerativeAI, SchemaType } = require("@google/generative-ai");

// INITIALIZING GEMINI AI SDK
function initGenAI() {
  try {
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
            reply: { type: SchemaType.STRING, nullable: true },
          },
        },
      },
    });

    return genAIModel;
  } catch (error) {
    console.error("Error =========>", error);
    throw new Error("Failed to initialize GenAI Client");
  }
}

module.exports = { initGenAI };
