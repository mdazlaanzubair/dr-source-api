// FUNCTION TO STORE THE VECTOR EMBEDDINGS TO THE DATABASE
async function store_vec(
  document_embedded_chunks,
  document_chunks,
  name_space,
  pineconeIndex
) {
  // ITERATING ALL EMBEDDED_CHUNKS AND PREPARING REFERENCE FOR
  // PINECONE_DB FOR SAVING IN PINECONE_DB
  const vectors_refs = document_embedded_chunks.map(
    ({ page_num, vectors }, index) => ({
      id: `${index}-doc-${Date.now().toString()}`, // Simple unique ID generation
      values: vectors, // VECTOR OF THE TEXT
      metadata: {
        page_num: `${page_num}`,
        page_text: document_chunks[index].page_content_chunk,
      },
    })
  );

  // Splitting vectors into batches
  const batches = [];
  const batchSize = 1000;
  for (let i = 0; i < vectors_refs.length; i += batchSize) {
    batches.push(vectors_refs.slice(i, i + batchSize));
  }

  try {
    // STORING REFERENCE IN THE DB AT USER NAMESPACE PROVIDED
    // BY FRONTEND i.e. user_id + - + file_slug
    // Upsert each batch to Pinecone
    for (const batch of batches) {
      await pineconeIndex.namespace(`${name_space}`).upsert(batch);
    }
  } catch (error) {
    console.log("##########################");
    console.log("Error while storing vectors embeddings:\n", error);
    console.log("##########################");
    throw error;
  }
}

module.exports = { store_vec };
