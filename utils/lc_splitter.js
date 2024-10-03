import { RecursiveCharacterTextSplitter } from "langchain/text_splitter";

//  INITIALIZING TEXT SPLITTER
export const lc_splitter = new RecursiveCharacterTextSplitter({
  chunkSize: 512,
  chunkOverlap: 128, // 15-20% overlap for context retention
});
