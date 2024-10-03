import { configDotenv } from "dotenv";
import { chunk_to_vec_transformer } from "../../../utils/chunk_to_vec_transformer.js";
import { doc_to_chunk } from "../../../utils/doc_to_chunk.js";
import { file_reader } from "../../../utils/file_reader.js";
import { initPinecone } from "../../../utils/init_pinecone.js";
import { store_vec } from "../../../utils/store_vec.js";
configDotenv();

// INITIALIZING PINECONE INSTANCE
const pineconeIndex = initPinecone();

export const file_uploader = async (req, res) => {
  const file = req.file;
  const { fileName, slug, name_space } = req.body;

  if (!file) {
    res.json({ error: "File required", message: "File not uploaded" });
  }

  if (!name_space) {
    res.json({
      error: "Namespace required",
      message: "Namespace not uploaded",
    });
  }

  // PERFORMANCE EVALUATOR
  let start_time = performance.now();
  const process_eval = {
    text_extraction: 0,
    text_embedding: 0,
    vectors_storage: 0,
    total_process: 0,
  };

  try {
    // CONVERTING FILE TO DOCUMENT ARRAY PAGE-BY-PAGE
    // [ { page_num, page_content } ]
    const pdf_document = await file_reader(file.buffer);

    // CHUNKING THE DOCUMENT INTO 512 CHARACTERS STRING
    const document_chunks = await doc_to_chunk(pdf_document);
    process_eval.text_chunking = performance.now() - start_time; // CALCULATING TIME

    // CONVERTING DOCUMENTS CHUNKS INTO VECTOR EMBEDDINGS
    start_time = performance.now(); // RESET START TIME
    const document_embedded_chunks = await chunk_to_vec_transformer(
      document_chunks
    );
    process_eval.text_embedding = performance.now() - start_time; // CALCULATING TIME

    // STORING VECTOR EMBEDDINGS TO PINECONE DATABASE
    start_time = performance.now(); // RESET START TIME
    await store_vec(
      document_embedded_chunks,
      document_chunks,
      name_space,
      pineconeIndex
    );
    process_eval.vectors_storage = performance.now() - start_time; // CALCULATING TIME

    // CALCULATING TOTAL
    process_eval.total_process = Object.values(process_eval)
      .reduce((sum, value) => sum + value, 0)
      .toFixed(2);

    res.json({
      title: fileName,
      slug,
      process_eval,
      message: "File content is uploaded successfully!",
    });
  } catch (error) {
    console.error("Error =======>", error);
    return res.status(500).json({ message: "Error while processing PDF" });
  }
};
