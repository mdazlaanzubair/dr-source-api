# Dr. Source API (Backend)

This is the API for **Dr. Source**, utilizing **LangChain** and **Google Gemini AI** to handle **document parsing**, **vectorization**, and **question answering**.

## Features

- AI-powered document querying using large language models.
- Supports PDF parsing and embedding via LangChain and Pinecone DB.

## Installation

### 1. Clone the repository:

```bash
git clone https://github.com/mdazlaanzubair/dr-source-api
```

```bash
cd dr-source-api
```

### 2. Install dependencies:

```bash
npm install
```

### 3. Set up your environment variables:

Rename `.env.example` to `.env`, add your values for:

```
 SUPABASE_URL=
 SUPABASE_PUBLIC_KEY=
 PINECONE_API_KEY=
 PINECONE_INDEX_NAME_384
```

### 4. Start the development server:

```bash
npm run dev
```

### 5. Scripts
- Runs the API in production: `npm run start`
- Starts the API in development mode: `npm run dev`

## Contributing

Open-source contributions are welcome! To contribute:

- Fork the repository.
- Work on a feature or fix in a new branch.
- Submit your pull request when ready!

Your help in improving **Dr. Source** will be highly appreciated!
