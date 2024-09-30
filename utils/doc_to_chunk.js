const { lc_splitter } = require("./lc_splitter");
const { text_pre_processor } = require("./text_pre_processor");

// FUNCTION TO SPLIT TEXT TO CHUNKS RECURSIVELY USING LANG_CHAIN
async function doc_to_chunk(pdf_document) {
  // DUE TO RATE LIMITING CONSTRAINT AT HUGGING_FACE API
  // PAGE BY PAGE EMBEDDING IS NOT POSSIBLE THEREFORE
  // FOLLOWING CODE IS COMMENTED UNTIL WE EXPLORE ALTERNATIVE STRATEGY
  // ITERATING ALL PAGES OF THE DOCUMENT AND SPLITTING CHUNKS RECURSIVELY
  //   const text_chunks = [];
  //   for (const { page_num, page_text } of pdf_document) {
  //     const chunks = await lc_splitter.splitText(page_text);
  //     const updated_chunks = chunks?.map((chunk) => ({ chunk, page_num }));
  //     text_chunks.push(...updated_chunks);
  //   }

  // =========================
  // HERE IS THE NEW APPROACH
  // =========================
  // WE'LL MERGE ALL PAGES TEXT INTO ONE BIT RAW TEXT AND THEN
  let raw_text = pdf_document?.map(({ page_text }) => page_text)?.join(" ");

  // PREPROCESSING THE TEXT BEFORE CHUNKING
  const pre_processed_text = text_pre_processor(raw_text);

  // HERE IS THE NEW APPROACH INSTEAD OF PAGE BY PAGE CHUNKING
  return await lc_splitter.splitText(pre_processed_text);
}

module.exports = { doc_to_chunk };
