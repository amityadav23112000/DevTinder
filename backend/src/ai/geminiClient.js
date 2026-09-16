const { ChatGoogleGenerativeAI } = require("@langchain/google-genai");

// One shared Gemini chat model, reused across every request instead of
// creating a new client each time.
const geminiModel = new ChatGoogleGenerativeAI({
  apiKey: process.env.GEMINI_API_KEY,
  model: "gemini-3.6-flash", // fast + cheap, good enough for short profile text
  temperature: 0.4, // a bit of variety, but still mostly consistent output
  maxRetries: 1, // fail fast on rate limits instead of silently retrying for 30+ seconds
});

module.exports = { geminiModel };
