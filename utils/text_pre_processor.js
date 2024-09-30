const { removeStopwords } = require("stopword");

// FUNCTION TO PREPROCESS TEXT BEFORE SPLITTING AND VECTOR GENERATION
function text_pre_processor(text) {
  // CHANGING TEXT CASE
  const lowercasedText = text.toLowerCase();

  // REMOVING STOP WORDS
  const cleanedText = removeStopwords(lowercasedText.split(" ")).join(" ");

  // REMOVING EXTRA SPACES
  const finalText = cleanedText.replace(/\s+/g, " ").trim();

  return finalText;
}

module.exports = { text_pre_processor };
