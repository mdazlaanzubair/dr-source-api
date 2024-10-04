// FUNCTION TO CONVERT TEXT CHUNKS INTO VECTOR EMBEDDINGS
async function chunk_to_vec(document_chunks, isQuery = false) {
  const { pipeline } = await import("@xenova/transformers");

  // INITIALIZING THE EMBEDDING PIPELINE
  const embeddingsGenerator = await pipeline(
    "feature-extraction",
    "Xenova/all-MiniLM-L6-v2"
  );

  // Iterate over each text chunk
  if (isQuery) {
    const question = document_chunks;
    const output = await embeddingsGenerator(question, {
      pooling: "mean",
      normalize: true,
    });

    // Check if output is a Float32Array
    if (output.data instanceof Float32Array) {
      // Convert Float32Array to regular array
      return Array.from(output.data);
    } else {
      console.error("Unexpected output format:", output.data);
      return;
    }
  } else {
    const document_embedded_chunks = [];

    for (const { page_num, page_content_chunk } of document_chunks) {
      const output = await embeddingsGenerator(page_content_chunk, {
        pooling: "mean",
        normalize: true,
      });

      // Check if output is a Float32Array
      if (output.data instanceof Float32Array) {
        // Convert Float32Array to regular array
        const vectorArray = Array.from(output.data);
        // Push the converted array to document_embedded_chunks
        document_embedded_chunks.push({ page_num, vectors: vectorArray });
      } else {
        console.error("Unexpected output format:", output.data);
      }
    }

    return document_embedded_chunks;
  }
}

module.exports = { chunk_to_vec };
