const { RecursiveCharacterTextSplitter } = require("langchain/text_splitter");

//  INITIALIZING TEXT SPLITTER
const lc_splitter = new RecursiveCharacterTextSplitter({
  chunkSize: 1024, // Slightly below the 512 token limit for safety
  chunkOverlap: 204, // 15-20% overlap for context retention
});

module.exports = { lc_splitter };
