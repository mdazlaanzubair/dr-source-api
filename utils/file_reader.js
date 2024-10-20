const PdfParse = require("pdf-parse");
const { text_pre_processor } = require("./text_pre_processor");

async function file_reader(file_buffer) {
  try {
    const { text } = await PdfParse(file_buffer);

    // Split the extracted text into chunks by pages or paragraphs
    const pages = text.split(/\n\s*\n/);
    let pageNum = 0;

    // Filter out empty or whitespace-only pages and process the content
    const document = pages.reduce((accumulate, page_content) => {
      const trimmedContent = page_content.trim();

      // Only include non-empty pages
      if (trimmedContent.length) {
        pageNum += 1;

        accumulate.push({
          page_num: pageNum,
          page_content: text_pre_processor(trimmedContent),
        });
      }

      return accumulate;
    }, []);

    return document;
  } catch (error) {
    console.log("##########################")
    console.log("Error while file reading:\n", error);
    console.log("##########################")
    throw error;
  }
}

module.exports = { file_reader };
