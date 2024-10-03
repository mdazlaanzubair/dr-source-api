import { RecursiveCharacterTextSplitter } from "langchain/text_splitter";

// FUNCTION TO SPLIT TEXT TO CHUNKS RECURSIVELY USING LANG_CHAIN
export async function doc_to_chunk(pdf_document) {
  // INITIALIZING TEXT SPLITTER USING LANG-CHAIN
  const lc_splitter = new RecursiveCharacterTextSplitter({
    chunkSize: 512,
    chunkOverlap: 128, // 15-20% overlap for context retention
  });

  // ITERATING ALL PAGES OF THE DOCUMENT AND SPLITTING CHUNKS RECURSIVELY
  const document_chunks = [];
  for (const { page_num, page_content } of pdf_document) {
    // CHUNKS OF SINGLE PAGE CONTENT
    const page_chunks = await lc_splitter.splitText(page_content);

    // ATTACHING PAGE NUMBER REFERENCE WITH EACH page_chunks
    const updated_page_chunks = page_chunks?.map((chunk) => ({
      page_content_chunk: chunk,
      page_num,
    }));

    // PUSHING UPDATED CHUNKS AFTER REFERENCING INTO document_chunks ARRAY
    document_chunks.push(...updated_page_chunks);
  }

  // RETURNING THE DOCUMENT CHUNKS
  return document_chunks;
}
