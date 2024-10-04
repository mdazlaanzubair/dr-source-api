const { configDotenv } = require("dotenv");
const { text_pre_processor } = require("../../../utils/text_pre_processor");
const { chunk_to_vec } = require("../../../utils/chunk_to_vec");
const { generateAIResponse } = require("../../../utils/generate_ai_response");
const { initPinecone } = require("../../../utils/init_pinecone");

configDotenv();

// INITIALIZING PINECONE INSTANCE
const pineconeIndex = initPinecone();

async function response_generator(req, res) {
  const { question, name_space } = req.body;

  if (!question || question?.length <= 0) {
    res.json({ error: "Question required", message: "Question not found" });
  }

  if (!name_space || name_space?.length <= 0) {
    res.json({ error: "Namespace required", message: "Namespace is missing" });
  }

  // PERFORMANCE EVALUATOR
  let start_time = performance.now();
  const process_eval = {
    text_embedding: 0,
    similarity_search: 0,
    ai_generation: 0,
    total_process: 0,
  };

  try {
    // CONVERTING QUESTION INTO VECTOR EMBEDDINGS
    const cleaned_text = text_pre_processor(question);
    const embedded_question = await chunk_to_vec(cleaned_text, true);
    process_eval.text_embedding = performance.now() - start_time; // CALCULATING TIME

    // QUERYING PINECONE DB TO GET THE MATCHING VECTOR
    start_time = performance.now(); // RESET START TIME
    // CONVERTING INTO PURE FLAT ARRAY

    const query_response = await pineconeIndex
      .namespace(`${name_space}`)
      .query({
        vector: embedded_question,
        topK: 65,
        includeMetadata: true,
      });
    process_eval.similarity_search = performance.now() - start_time; // CALCULATING TIME

    // MAKING SINGLE DOCUMENT FOR CONTEXT FROM PINE CONE RESPONSE
    // MAKING SOURCES FOR SENDING TO FRONTEND AS AN EVIDENCE
    const context = [];
    const context_source = [];

    query_response.matches.forEach((match) => {
      context.push(match.metadata.page_text);
      context_source.push({
        page_num: match.metadata.page_num,
        page_text: match.metadata.page_text,
      });
    });

    // REQUESTING LLM TO GENERATE RESPONSE BY MERGING ALL MATCHED CONTEXT DOCS INTO SINGLE STRING
    start_time = performance.now(); // RESET START TIME
    const ai_response = await generateAIResponse(context?.join(" "), question);
    process_eval.ai_generation = performance.now() - start_time; // CALCULATING TIME

    // CALCULATING TOTAL
    process_eval.total_process = Object.values(process_eval)
      .reduce((sum, value) => sum + value, 0)
      .toFixed(2);

    res.json({
      success: true,
      question,
      context_source,
      ai_response,
      process_eval,
      message: "Query answered successfully",
    });
  } catch (error) {
    console.error("Error =======>", error);
    return res.status(500).json({ message: "Error while processing PDF" });
  }
}

module.exports = { response_generator };
