// One-time data script: generates embeddings for any existing user who
// doesn't have one yet (e.g. users created before this feature existed).
// Run with: node scripts/backfill-embeddings.js
require("dotenv").config();
const mongoose = require("mongoose");
const User = require("../src/models/user");
const { generateProfileEmbedding } = require("../src/ai/profileEmbedding");

async function main() {
  await mongoose.connect(process.env.MONGO_URI);
  console.log("Connected to MongoDB.");

  // select('+embedding') because it's select:false in the schema
  const users = await User.find({ embedding: { $exists: false } }).select("+embedding");
  console.log(`Found ${users.length} users without an embedding.`);

  let updated = 0;
  let skipped = 0;

  for (const user of users) {
    const embedding = await generateProfileEmbedding(user);
    if (!embedding) {
      skipped++; // empty profile — nothing meaningful to embed
      continue;
    }
    user.embedding = embedding;
    await user.save();
    updated++;
    if (updated % 10 === 0) console.log(`Embedded ${updated}...`);
  }

  console.log(`Done. Embedded ${updated} users, skipped ${skipped} (empty profiles).`);
  await mongoose.disconnect();
}

main().catch((error) => {
  console.error("Backfill failed:", error);
  process.exit(1);
});
