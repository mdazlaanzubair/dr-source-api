const { configDotenv } = require("dotenv");
const { initPinecone } = require("../../../utils/init_pinecone");
const { file_reader } = require("../../../utils/file_reader");
const { doc_to_chunk } = require("../../../utils/doc_to_chunk");
const { chunk_to_vec } = require("../../../utils/chunk_to_vec");
const { store_vec } = require("../../../utils/store_vec");
const { store_file_record } = require("../../../utils/supabase_storage");

configDotenv();

// INITIALIZING PINECONE INSTANCE
const pineconeIndex = initPinecone();

async function file_uploader(req, res) {
  const file = req.file;
  const { fileName, slug, name_space, user_id } = req.body;

  if (!file) {
    res.json({ error: "File required", message: "File not uploaded" });
  }

  if (!name_space) {
    res.json({
      error: "Namespace required",
      message: "Namespace not available",
    });
  }

  if (!slug) {
    res.json({
      error: "Slug required",
      message: "File slug not available",
    });
  }

  if (!user_id) {
    res.json({
      error: "User ID required",
      message: "User ID is not available",
    });
  }

  // PERFORMANCE EVALUATOR
  let total_time_taken = performance.now();

  try {
    // CONVERTING FILE TO DOCUMENT ARRAY PAGE-BY-PAGE
    // @returns [ { page_num, page_content } ]
    const pdf_document = await file_reader(file.buffer);

    // CHUNKING THE DOCUMENT INTO 512 CHARACTERS STRING
    const document_chunks = await doc_to_chunk(pdf_document);

    // CONVERTING DOCUMENTS CHUNKS INTO VECTOR EMBEDDINGS
    const document_embedded_chunks = await chunk_to_vec(document_chunks);

    // STORING VECTOR EMBEDDINGS TO PINECONE DATABASE
    await store_vec(
      document_embedded_chunks,
      document_chunks,
      name_space,
      pineconeIndex
    );

    // STORING FILE INFORMATION IN THE DATABASE
    const fileData = await store_file_record({ title: fileName, slug, user_id });

    res.json({
      fileData,
      total_time_taken: performance.now() - total_time_taken,
      message: "File content is uploaded successfully!",
    });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
}

module.exports = { file_uploader };
