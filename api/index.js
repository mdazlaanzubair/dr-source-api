const { configDotenv } = require("dotenv");
const { json } = require("express");
const express = require("express");
const multer = require("multer");
const cors = require("cors");
const { file_uploader } = require("./controllers/file_upload/index.js");
const {
  response_generator,
} = require("./controllers/response_generator/index.js");

// Multer setup to read file into memory without storing it
const upload = multer({ storage: multer.memoryStorage() });

configDotenv();

const app = express();

// middlewares
app.use(
  cors({
    origin: "*",
    credentials: true,
  })
);
app.use(json());

// TEST API
app.get("/api", async (req, res) => res.json({ message: "API Running" }));

app.post("/api/upload", upload.single("file"), file_uploader);

app.post("/api/query", response_generator);

// REQUEST QUERY
// app.post("/api/query", async (req, res) => {
//   const { question, name_space } = req.body;
//   let start_time = performance.now();
//   const process_eval = {
//     text_chunking: 0,
//     vectors_embedding: 0,
//     similarity_search: 0,
//     ai_generation: 0,
//     total_process: 0,
//   };

//   if (!question || question?.length <= 0) {
//     res.json({ error: "Question required", message: "Question not found" });
//   }

//   if (!name_space || name_space?.length <= 0) {
//     res.json({ error: "Namespace required", message: "Namespace is missing" });
//   }

//   try {
//     // CONVERTING QUESTION INTO VECTOR EMBEDDINGS
//     const pre_processed_question = text_pre_processor(question);
//     process_eval.text_chunking = performance.now() - start_time; // CALCULATING TIME

//     start_time = performance.now(); // RESET START TIME
//     // const embedded_question = await chunk_to_vec([pre_processed_question]);
//     const embedded_question = await chunk_to_vec_transformer([
//       pre_processed_question,
//     ]);
//     process_eval.vectors_embedding = performance.now() - start_time; // CALCULATING TIME
//     console.log("Step 1/3 - Embedding complete!");

//     // QUERYING PINECONE DB TO GET THE MATCHING VECTOR
//     start_time = performance.now(); // RESET START TIME
//     const query_response = await pineconeIndex
//       .namespace(`${name_space}`)
//       .query({
//         vector: embedded_question[0],
//         topK: 15,
//         includeMetadata: true,
//       });
//     process_eval.similarity_search = performance.now() - start_time; // CALCULATING TIME
//     console.log("Step 2/3 - Query pinecone completed!");

//     // MAKING SINGLE DOCUMENT FOR CONTEXT FROM PINE CONE RESPONSE
//     const context_document = query_response.matches?.map(
//       (match) => match.metadata.page_text
//     );

//     // REQUESTING LLM TO GENERATE RESPONSE BY MERGING ALL MATCHED CONTEXT DOCS INTO SINGLE STRING
//     start_time = performance.now(); // RESET START TIME
//     const ai_response = await generateAIResponse(
//       context_document?.join(" "),
//       question
//     );
//     process_eval.ai_generation = performance.now() - start_time; // CALCULATING TIME
//     console.log("Step 3/3 - AI Response Generated!");

//     // CALCULATING TOTAL
//     process_eval.total_process = Object.values(process_eval)
//       .reduce((sum, value) => sum + value, 0)
//       .toFixed(2);

//     res.json({
//       success: true,
//       question,
//       context_document,
//       ai_response,
//       process_eval,
//       message: "PDF processed successfully",
//     });
//   } catch (error) {
//     console.error("Error =======>", error);
//     return res.status(500).json({ message: "Error while processing PDF" });
//   }
// });

// START THE SERVER
const PORT = process.env.PORT || 8000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
