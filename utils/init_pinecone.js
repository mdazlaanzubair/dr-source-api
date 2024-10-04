const { Pinecone } = require("@pinecone-database/pinecone");

// INITIALIZING PINECONE INSTANCE
function initPinecone() {
  try {
    const pc = new Pinecone({
      apiKey: process.env.PINECONE_API_KEY,
    });

    const index = pc.Index(process.env.PINECONE_INDEX_NAME_384);
    return index;
  } catch (error) {
    console.error("error", error);
    throw new Error("Failed to initialize Pinecone Client");
  }
}

module.exports = { initPinecone };
