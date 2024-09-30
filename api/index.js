require("dotenv").config();
const express = require("express");
const cors = require("cors");
const { initPinecone } = require("../utils/init_pinecone");
const { doc_to_chunk } = require("../utils/doc_to_chunk");
const { chunk_to_vec } = require("../utils/chunk_to_vec");
const { store_vec } = require("../utils/store_vec");
const { generateAIResponse } = require("../utils/generate_ai_response");
const { text_pre_processor } = require("../utils/text_pre_processor");

const app = express();

// middlewares
app.use(
  cors({
    origin: "*",
    credentials: true,
  })
);
app.use(express.json());

// INITIALIZING PINECONE INSTANCE
const pineconeIndex = initPinecone();

// TEST API
app.get("/api", async (req, res) => res.json({ message: "API Running" }));

// GENERATE EMBEDDINGS
app.post("/api/text-to-vec", async (req, res) => {
  const { pdf_document, name_space } = req.body;
  let start_time = performance.now();
  const process_eval = {
    text_chunking: 0,
    vectors_embedding: 0,
    vectors_storage: 0,
    total_process: 0,
  };

  if (!pdf_document || pdf_document?.length <= 0) {
    res.json({ error: "Document required", message: "Document not found" });
  }

  if (!name_space || name_space?.length <= 0) {
    res.json({ error: "Namespace required", message: "Namespace is missing" });
  }

  try {
    // SPLITTING LONG TEXT IN TO SMALL CHUNKS
    const text_chunks = await doc_to_chunk(pdf_document);
    process_eval.text_chunking = performance.now() - start_time; // CALCULATING TIME
    console.log("\nStep 1/3 - Chunking complete!");

    // CONVERTING CHUNKS INTO VECTOR EMBEDDINGS
    start_time = performance.now(); // RESET START TIME
    const embedded_chunks = await chunk_to_vec(text_chunks);

    process_eval.vectors_embedding = performance.now() - start_time; // CALCULATING TIME
    console.log("\nStep 2/3 - Embedding complete!");

    // SAVING EMBEDDINGS TO THE DATABASE
    start_time = performance.now(); // RESET START TIME
    await store_vec(embedded_chunks, text_chunks, name_space, pineconeIndex);
    process_eval.vectors_storage = performance.now() - start_time; // CALCULATING TIME
    console.log("\nStep 3/3 - Pinecone db complete!");

    // CALCULATING TOTAL
    process_eval.total_process = Object.values(process_eval)
      .reduce((sum, value) => sum + value, 0)
      .toFixed(2);

    res.json({
      success: true,
      process_eval,
      message: "PDF processed and embeddings stored in Pinecone",
    });
  } catch (error) {
    console.error("Error =======>", error);
    return res.status(500).json({ message: "Error while processing PDF" });
  }
});

// REQUEST QUERY
app.post("/api/query", async (req, res) => {
  const { question, name_space } = req.body;
  let start_time = performance.now();
  const process_eval = {
    text_chunking: 0,
    vectors_embedding: 0,
    similarity_search: 0,
    ai_generation: 0,
    total_process: 0,
  };

  if (!question || question?.length <= 0) {
    res.json({ error: "Question required", message: "Question not found" });
  }

  if (!name_space || name_space?.length <= 0) {
    res.json({ error: "Namespace required", message: "Namespace is missing" });
  }

  try {
    // CONVERTING QUESTION INTO VECTOR EMBEDDINGS
    const pre_processed_question = text_pre_processor(question);
    process_eval.text_chunking = performance.now() - start_time; // CALCULATING TIME

    start_time = performance.now(); // RESET START TIME
    const embedded_question = await chunk_to_vec([pre_processed_question]);
    process_eval.vectors_embedding = performance.now() - start_time; // CALCULATING TIME
    console.log("Step 1/3 - Embedding complete!");

    // QUERYING PINECONE DB TO GET THE MATCHING VECTOR
    start_time = performance.now(); // RESET START TIME
    const query_response = await pineconeIndex
      .namespace(`${name_space}`)
      .query({
        vector: embedded_question[0],
        topK: 10,
        includeMetadata: true,
      });
    process_eval.similarity_search = performance.now() - start_time; // CALCULATING TIME
    console.log("Step 2/3 - Query pinecone completed!");

    // MAKING SINGLE DOCUMENT FOR CONTEXT FROM PINE CONE RESPONSE
    const context_document = query_response.matches?.map(
      (match) => match.metadata.page_text
    );

    // REQUESTING LLM TO GENERATE RESPONSE BY MERGING ALL MATCHED CONTEXT DOCS INTO SINGLE STRING
    start_time = performance.now(); // RESET START TIME
    const ai_response = await generateAIResponse(
      context_document?.join(" "),
      question
    );
    process_eval.ai_generation = performance.now() - start_time; // CALCULATING TIME
    console.log("Step 3/3 - AI Response Generated!");

    // CALCULATING TOTAL
    process_eval.total_process = Object.values(process_eval)
      .reduce((sum, value) => sum + value, 0)
      .toFixed(2);

    res.json({
      success: true,
      question,
      context_document,
      ai_response,
      process_eval,
      message: "PDF processed successfully",
    });
  } catch (error) {
    console.error("Error =======>", error);
    return res.status(500).json({ message: "Error while processing PDF" });
  }
});

// START THE SERVER
const PORT = process.env.PORT || 8000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
