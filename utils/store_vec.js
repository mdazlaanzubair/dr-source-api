// FUNCTION TO STORE THE VECTOR EMBEDDINGS TO THE DATABASE
async function store_vec(
  embedded_chunks,
  text_chunks,
  name_space,
  pineconeIndex
) {
  // DUE TO RATE LIMITING CONSTRAINT AT HUGGING_FACE API
  // PAGE BY PAGE EMBEDDING IS NOT POSSIBLE THEREFORE
  // FOLLOWING CODE IS COMMENTED UNTIL WE EXPLORE ALTERNATIVE STRATEGY
  // ITERATING ALL EMBEDDED_CHUNKS AND SAVING IN PINECONE_DB
  //   for (const { embedding: vector, page_num } of embedded_chunks) {
  //     try {
  //       // PREPARING REFERENCE FOR PINECONE_DB
  //       const vectors_ref = {
  //         id: `doc-${Date.now().toString()}`, // Simple unique ID generation
  //         values: vector, // VECTOR OF THE TEXT
  //         metadata: {
  //           page_text: text_chunks[page_num],
  //           page_num,
  //         },
  //       };

  //       // STORING REFERENCE IN THE DB AT USER NAMESPACE PROVIDED BY FRONTEND i.e. user_id + - + file_name
  //       pineconeIndex.namespace(`${name_space}`).upsert(vectors_ref);
  //     } catch (error) {
  //       throw error;
  //     }
  //   }

  // =========================
  // HERE IS THE NEW APPROACH
  // =========================
  // ITERATING ALL EMBEDDED_CHUNKS AND PREPARING REFERENCE FOR
  // PINECONE_DB FOR SAVING IN PINECONE_DB
  const vectors_refs = embedded_chunks.map((vector, index) => {
    return {
      id: `${index}-doc-${Date.now().toString()}`, // Simple unique ID generation
      values: vector, // VECTOR OF THE TEXT
      metadata: {
        page_text: text_chunks[index],
      },
    };
  });
  try {
    // STORING REFERENCE IN THE DB AT USER NAMESPACE PROVIDED
    // BY FRONTEND i.e. user_id + - + file_slug
    pineconeIndex.namespace(`${name_space}`).upsert(vectors_refs);
  } catch (error) {
    throw error;
  }
}

module.exports = { store_vec };
