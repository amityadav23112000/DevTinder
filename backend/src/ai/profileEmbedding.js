const { embeddingModel } = require("./embeddingClient");

// Combines the parts of a profile that actually describe "what this
// developer does" into one plain-text block — this is what gets embedded.
// (firstName/age/gender don't say anything about semantic similarity, so
// they're left out on purpose.)
//
// Skills are a clean, structured signal; free-text "about" is noisy by
// comparison (more so for generic/templated bios, but even real ones vary
// more in style than in substance). Putting skills first AND repeating them
// at the end gives that structured signal more weight in the resulting
// embedding than a single mention buried mid-paragraph would.
const buildProfileText = (user) => {
  const skillsList = user.skills?.length ? user.skills.join(", ") : null;
  const parts = [
    skillsList ? `Primary skills and technologies: ${skillsList}.` : null,
    user.about,
    user.organization ? `Works at or studies at: ${user.organization}.` : null,
    skillsList ? `Technologies used: ${skillsList}.` : null,
  ].filter(Boolean); // drop any empty/missing pieces

  return parts.join(" ");
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
