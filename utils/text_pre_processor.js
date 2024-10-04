// FUNCTION TO PREPROCESS TEXT BEFORE SPLITTING AND VECTOR GENERATION
function text_pre_processor(text) {
  return text
    ?.replace(/[^\x00-\x7F]+/g, "") // Remove non-ASCII characters
    ?.replace(/[^\w\s]/g, "") // Remove special characters, keep alphanumeric and spaces
    ?.replace(/\s+/g, " ") // Replace multiple spaces with a single space
    ?.trim(); // Trim leading and trailing spaces
}

module.exports = { text_pre_processor };
