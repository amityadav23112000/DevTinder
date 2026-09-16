// One-time setup script: creates the Atlas Vector Search index used for
// AI-based "who to connect with" recommendations.
// Run manually with: node scripts/create-vector-index.js
require("dotenv").config();
const mongoose = require("mongoose");

const INDEX_NAME = "user_embedding_index";
// Must match the output size of the embedding model in embeddingClient.js
// (gemini-embedding-2) — a mismatch here makes the index unusable.
const EMBEDDING_DIMENSIONS = 3072;

async function main() {
  await mongoose.connect(process.env.MONGO_URI);
  console.log("Connected to MongoDB.");

  const usersCollection = mongoose.connection.db.collection("users");

  // Don't try to create it twice — check what indexes already exist first.
  const existingIndexes = await usersCollection.listSearchIndexes().toArray();
  const alreadyExists = existingIndexes.some((index) => index.name === INDEX_NAME);

  if (alreadyExists) {
    console.log(`Index "${INDEX_NAME}" already exists — skipping creation.`);
  } else {
    await usersCollection.createSearchIndex({
      name: INDEX_NAME,
      type: "vectorSearch",
      definition: {
        fields: [
          {
            type: "vector",
            path: "embedding",
            numDimensions: EMBEDDING_DIMENSIONS,
            similarity: "cosine", // measures how close two profiles are in meaning
          },
        ],
      },
    });
    console.log(`Created index "${INDEX_NAME}".`);
  }

  // Vector Search indexes take a little time to finish building after
  // creation — wait here so the script only exits once it's actually usable.
  console.log("Waiting for the index to finish building...");
  let ready = false;
  while (!ready) {
    const indexes = await usersCollection.listSearchIndexes().toArray();
    const index = indexes.find((i) => i.name === INDEX_NAME);
    ready = index?.queryable === true;
    if (!ready) {
      await new Promise((resolve) => setTimeout(resolve, 3000));
    }
  }

  console.log("Index is ready and queryable.");
  await mongoose.disconnect();
}

main().catch((error) => {
  console.error("Failed to set up vector index:", error.message);
  process.exit(1);
});
