const { GoogleGenerativeAIEmbeddings } = require("@langchain/google-genai");

// One shared embeddings client, same idea as geminiClient.js — this one
// turns text into a vector of numbers instead of generating a chat reply.
const embeddingModel = new GoogleGenerativeAIEmbeddings({
  apiKey: process.env.GEMINI_API_KEY,
  model: "gemini-embedding-2",
  maxRetries: 1, // fail fast on rate limits instead of silently retrying for 30+ seconds
});

module.exports = { embeddingModel };
