const { default: axios } = require("axios");
const { delay } = require("./delay");

// FUNCTION TO CONVERT TEXT CHUNKS INTO VECTOR EMBEDDINGS
async function chunk_to_vec(text_chunks) {
  // DUE TO RATE LIMITING CONSTRAINT AT HUGGING_FACE API
  // PAGE BY PAGE EMBEDDING IS NOT POSSIBLE THEREFORE
  // FOLLOWING CODE IS COMMENTED UNTIL WE EXPLORE ALTERNATIVE STRATEGY
  // ITERATING ALL CHUNKS TO GENERATE EMBEDDINGS
  //  const embedded_chunks = [];
  //   for (const { chunk, page_num } of text_chunks) {
  //     try {
  //       // CALLING HUGGING_FACE API TO GENERATE EMBEDDINGS
  //       const response = await axios.post(
  //         HF_URL,
  //         { inputs: chunk },
  //         { headers: HF_HEADER }
  //       );

  //       const embedding = response.data;
  //       embedded_chunks.push({ embedding, page_num });
  //     } catch (error) {
  //       throw error;
  //     }
  //   }

  // =========================
  // HERE IS THE NEW APPROACH
  // =========================
  const embedded_chunks = [];
  // SENDING A BATCH OF 5 CHUNKS AT A TIME (max limit for hugging face batch is 32)
  const batch_size = 30;

  //  INITIALIZING HUGGING FACE HEADER
  const HF_URL = `${process.env.HF_API_URL}`;
  const HF_HEADER = {
    Authorization: `Bearer ${process.env.HF_TOKEN}`,
    "x-wait-for-model": true,
  };

  // Splitting the chunks into smaller batches
  for (let i = 0; i < text_chunks.length; i += batch_size) {
    const batch = text_chunks.slice(i, i + batch_size);

    try {
      // Calling the Hugging Face API to generate embeddings for the current batch
      const response = await axios.post(
        HF_URL,
        { inputs: batch }, // Inputs must be an array of strings
        { headers: HF_HEADER }
      );

      embedded_chunks.push(...response.data);

      // Adding a delay between batches to avoid rate limits
      await delay(100); // 1-second delay between batches (you can adjust this)
    } catch (error) {
      console.error(
        `Error processing batch starting at chunk ${i}:`,
        error || error.message
      );
      throw error;
    }
  }

  return embedded_chunks;
}

module.exports = { chunk_to_vec };
