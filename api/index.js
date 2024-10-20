const { configDotenv } = require("dotenv");
const { json } = require("express");
const express = require("express");
const multer = require("multer");
const cors = require("cors");
const { file_uploader } = require("./controllers/file_upload/index.js");
const {
  response_generator,
} = require("./controllers/response_generator/index.js");

// Multer setup to read file into memory without storing it
const upload = multer({ storage: multer.memoryStorage() });

configDotenv();

const app = express();

// middlewares
app.use(
  cors({
    origin: "*",
    credentials: true,
  })
);
app.use(json());

// TEST API
app.get("/api", async (req, res) => res.json({ message: "API Running" }));

app.post("/api/upload", upload.single("file"), file_uploader);

app.post("/api/query", response_generator);

// START THE SERVER
const PORT = process.env.PORT || 8000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
