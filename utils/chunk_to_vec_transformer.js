import { pipeline } from "@xenova/transformers";

// FUNCTION TO CONVERT TEXT CHUNKS INTO VECTOR EMBEDDINGS
export async function chunk_to_vec_transformer(text_chunks) {
  const embedded_chunks = [];

  const embeddingsGenerator = await pipeline(
    "feature-extraction",
    "Xenova/all-MiniLM-L6-v2"
  );

  // Iterate over each text chunk
  for (const chunk of text_chunks) {
    const output = await embeddingsGenerator(chunk, {
      pooling: "mean",
      normalize: true,
    });

    // Check if output is a Float32Array
    if (output.data instanceof Float32Array) {
      // Convert Float32Array to regular array
      const vectorArray = Array.from(output.data);
      embedded_chunks.push(vectorArray); // Push the converted array to embedded_chunks
    } else {
      console.error("Unexpected output format:", output.data);
    }
  }

  console.log("embedded_chunks", embedded_chunks.length);
  return embedded_chunks;
}
