const { lc_splitter } = require("./lc_splitter");

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
  // HERE IS THE NEW APPROACH INSTEAD OF PAGE BY PAGE CHUNKING
  // WE'LL MERGE ALL PAGES TEXT INTO ONE BIT RAW TEXT AND THEN
  // MAKE SMALL CHUNKS FROM IT
  let raw_text = pdf_document?.map(({ page_text }) => page_text)?.join(" ");

  return await lc_splitter.splitText(raw_text);
}

module.exports = { doc_to_chunk };
