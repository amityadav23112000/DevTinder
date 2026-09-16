const { embeddingModel } = require("./embeddingClient");

// Combines the parts of a profile that actually describe "what this
// developer does" into one plain-text block — this is what gets embedded.
// (firstName/age/gender don't say anything about semantic similarity, so
// they're left out on purpose.)
const buildProfileText = (user) => {
  const parts = [
    user.about,
    user.skills?.length ? `Skills: ${user.skills.join(", ")}` : null,
    user.organization ? `Works at or studies at: ${user.organization}` : null,
  ].filter(Boolean); // drop any empty/missing pieces

  return parts.join(". ");
};

// Turns a user's profile text into an embedding vector (an array of numbers).
const generateProfileEmbedding = async (user) => {
  const text = buildProfileText(user);
  if (!text.trim()) {
    return undefined; // nothing meaningful to embed yet
  }
  return embeddingModel.embedQuery(text);
};

module.exports = { generateProfileEmbedding, buildProfileText };
