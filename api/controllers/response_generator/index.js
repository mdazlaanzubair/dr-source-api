const { configDotenv } = require("dotenv");
const { text_pre_processor } = require("../../../utils/text_pre_processor");
const { chunk_to_vec } = require("../../../utils/chunk_to_vec");
const { generateAIResponse } = require("../../../utils/generate_ai_response");
const { initPinecone } = require("../../../utils/init_pinecone");
const {
  store_query_record,
  get_api_key,
} = require("../../../utils/supabase_storage");

configDotenv();

// INITIALIZING PINECONE INSTANCE
const pineconeIndex = initPinecone();

async function response_generator(req, res) {
  const { question, name_space, file_id, user_id } = req.body;

  if (!question || question?.length <= 0) {
    res.json({ error: "Question required", message: "Question not found" });
  }

  if (!name_space || name_space?.length <= 0) {
    res.json({ error: "Namespace required", message: "Namespace is missing" });
  }

  if (!file_id) {
    res.json({
      error: "File ID required",
      message: "File ID is not available",
    });
  }

  if (!user_id) {
    res.json({
      error: "User ID required",
      message: "User ID is not available",
    });
  }

  // PERFORMANCE EVALUATOR
  let total_time_taken = performance.now();

  try {
    // GETTING API KEY OF THE USER FOR GEMINI
    const api_key = await get_api_key(user_id);

    // CONVERTING QUESTION INTO VECTOR EMBEDDINGS
    const cleaned_text = text_pre_processor(question);
    const embedded_question = await chunk_to_vec(cleaned_text, true);

    // QUERYING PINECONE DB TO GET THE MATCHING VECTOR
    // CONVERTING INTO PURE FLAT ARRAY
    const query_response = await pineconeIndex
      .namespace(`${name_space}`)
      .query({
        vector: embedded_question,
        topK: 10,
        includeMetadata: true,
      });

    // MAKING SINGLE DOCUMENT FOR CONTEXT FROM PINE CONE RESPONSE
    // MAKING SOURCES FOR SENDING TO FRONTEND AS AN EVIDENCE
    const context = [];
    const context_source = [];

    query_response.matches.forEach((match) => {
      context.push(match.metadata.page_text);

      const pageIndex = context_source.findIndex(
        (item) => item.page_num === match.metadata.page_num
      );

      if (pageIndex !== -1) {
        // If the page_num already exists, append the text
        context_source[pageIndex].page_text += " " + match.metadata.page_text;
      } else {
        // If the page_num doesn't exist, create a new object
        context_source.push({
          page_num: match.metadata.page_num,
          page_text: match.metadata.page_text,
        });
      }
    });

    // SORTING THE CONTEXT BY PAGE NUMBERS IN ASCENDING ORDER
    // Sort the context_source array by page_num in ascending order
    const ordered_context_source = context_source.sort(
      (a, b) => a.page_num - b.page_num
    );

    // REQUESTING LLM TO GENERATE RESPONSE BY MERGING ALL MATCHED CONTEXT DOCS INTO SINGLE STRING
    const ai_response = await generateAIResponse(context, question, api_key);

    // STORING QUERY INFORMATION IN THE DATABASE
    const queryData = await store_query_record({
      user_id,
      file_id,
      question,
      context: ordered_context_source,
      // SOPHISTICATEDLY HANDLING AI RESPONSE SAVING IN THE
      // DATABASE TO AVOID ANY TYPE ERRORS IN SUPABASE
      answer: ai_response
        ? `${ai_response}`
        : "Nothing found relevant with the query in the selected document.",
    });

    res.json({
      success: true,
      queryData,
      total_time_taken: performance.now() - total_time_taken,
      message: "Query answered successfully",
    });
  } catch (error) {
    console.error("Error =======>", error);
    return res.status(500).json({ message: "Error while processing PDF" });
  }
}

module.exports = { response_generator };
