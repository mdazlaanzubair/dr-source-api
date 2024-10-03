import getName from "emoji-dictionary";

// FUNCTION TO PREPROCESS TEXT BEFORE SPLITTING AND VECTOR GENERATION
export function text_pre_processor(text) {
  // CHANGING TEXT CASE
  const lowercasedText = text.toLowerCase();

  // REMOVING SPECIAL CHARACTERS (except letters, digits, and spaces)
  const noSpecialCharsText = lowercasedText
    .replace(/[^\w\s]|_/g, "")
    .replace(/\s+/g, " ")
    .replace(/\u0000/g, "");

  // REMOVING UNICODE CHARACTERS (including emojis)
  const noUnicodeText = noSpecialCharsText.replace(/[^\x00-\x7F]/g, "");

  // REPLACE EMOJIS WITH DESCRIPTIONS
  const replacedEmojisText = noUnicodeText.replace(
    /([\u{1F600}-\u{1F64F}])/gu,
    (match) => getName(match) || ""
  );

  // REMOVING STOP WORDS
  // const cleanedText = removeStopwords(replacedEmojisText.split(" ")).join(" ");

  // REMOVING CONTRACTIONS
  // const expanded_text = applyContraction(replacedEmojisText);

  // REMOVING EXTRA SPACES
  const finalText = replacedEmojisText.replace(/\s+/g, " ").trim();

  return finalText;
}
