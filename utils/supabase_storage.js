const { createClient } = require("@supabase/supabase-js");
const { configDotenv } = require("dotenv");

configDotenv();

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_PUBLIC_KEY
);

// FUNCTION TO STORE FILE RECORD IN SUPABASE
async function store_file_record(body) {
  try {
    const { slug } = body;

    // Step 1: Check if a file record with the same slug already exists
    const { data: existingRecord, error: fetchError } = await supabase
      .from("files")
      .select("*")
      .eq("slug", slug)
      .single(); // Single record expected

    if (fetchError && fetchError.code !== "PGRST116") {
      // PGRST116 is the code for no records found
      console.error("Error while fetching file record:\n", fetchError);
      throw fetchError;
    }

    let result;

    // Step 2: If record exists, update the existing one
    if (existingRecord) {
      const { data: updatedData, error: updateError } = await supabase
        .from("files")
        .update(body)
        .eq("slug", slug)
        .select();

      if (updateError) throw updateError;
      result = updatedData[0];
    } else {
      // Step 3: If no record exists, insert a new one
      const { data: insertedData, error: insertError } = await supabase
        .from("files")
        .insert(body)
        .select();

      if (insertError) throw insertError;
      result = insertedData[0];
    }

    return result;
  } catch (error) {
    console.log("##########################");
    console.log("Error while storing file record in supabase:\n", error);
    console.log("##########################");
    throw error;
  }
}

// FUNCTION TO STORE USER QUERY IN SUPABASE
async function store_query_record(body) {
  try {
    const { data, error } = await supabase
      .from("queries")
      .insert(body)
      .select();

    if (error) throw error;

    result = data[0];
    return result;
  } catch (error) {
    console.log("##########################");
    console.log("Error while storing query record in supabase:\n", error);
    console.log("##########################");
    throw error;
  }
}

// FUNCTION TO GET API KEY FROM SUPABASE
async function get_api_key(user_id) {
  try {
    const { data, error } = await supabase
      .from("user_api_key")
      .select("api_key")
      .eq("user_id", user_id);

    if (error) throw error;

    return data[0]?.api_key;
  } catch (error) {
    console.log("##########################");
    console.log("Error while fetching api key from supabase:\n", error);
    console.log("##########################");
    throw error;
  }
}

module.exports = { store_file_record, store_query_record, get_api_key };
