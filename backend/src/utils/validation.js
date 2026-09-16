const validator = require('validator');
const bcrypt = require('bcrypt');
const User = require('../models/user');
const { generateProfileEmbedding } = require('../ai/profileEmbedding');

const validationSignUpData = (req) => {
  const { firstName, lastName, email, password } = req.body;
  if (!firstName || !lastName || !email || !password) {
    throw new Error("All fields are required");
  }
  if (typeof firstName !== 'string' || typeof lastName !== 'string') {
    throw new Error("First name and last name must be strings");
  }
  if (!validator.isEmail(email)) {
    throw new Error("Invalid email format");
  }
  if (!validator.isStrongPassword(password)) {
    throw new Error("Password must be at least 8 characters long and contain at least one lowercase letter, one uppercase letter, and one number");
  }
}

const loginValidation = async (req) => {
  const { email, password } = req.body;
  // Step 1: Check if email and password are provided
  if (!email || !password) {
    throw new Error("Email and password are required");
  }

  // Step 2: Find the user by email (password is select:false, so ask for it explicitly)
  const user = await User.findOne({ email }).select("+password");
  if (!user) {
    throw new Error("User not found");
  }

  // Step 3: Compare passwords
  const isPasswordValid = await bcrypt.compare(password, user.password);
  if (!isPasswordValid) {
    throw new Error("Invalid password");
  }
  user.password = undefined; // don't send the hash back to the client
  req.user = user; // Attach user to the request object for further use
  // Step 4: All checks passed
  return true;
};

const profileEditValidation = async (req) => {
  const _id = req.user._id; // use logged-in user's id, not client-supplied _id
  const data = req.body;
  try {
    // Validate the data before updating
    const allowedEditFields = ["firstName", "lastName", "about", "gender", "age", "skills", "organization", "education", "linkedinUrl", "githubUrl", "leetcodeUrl", "codeforcesUrl"];
    const updates = Object.keys(data);
    // Remove _id from updates to prevent it from being edited
    if (updates.includes('_id')) {
      updates.splice(updates.indexOf('_id'), 1);
    }
    delete data._id; // don't let client change _id via update data
    // Check if the updates are valid
    const isValidOperation = updates.every((update) => allowedEditFields.includes(update));
    if (!isValidOperation) {
      throw new Error("Invalid updates!");
    }
    // If this edit touches any field the embedding is built from, regenerate
    // it using the FULL updated profile — not just the fields in this one
    // request — so it always reflects the user's complete, current profile.
    const embeddingFields = ["about", "skills", "organization"];
    const touchesEmbeddingFields = updates.some((field) => embeddingFields.includes(field));
    if (touchesEmbeddingFields) {
      const mergedProfile = {
        about: data.about !== undefined ? data.about : req.user.about,
        skills: data.skills !== undefined ? data.skills : req.user.skills,
        organization: data.organization !== undefined ? data.organization : req.user.organization,
      };
      // Best-effort: if embedding generation fails (e.g. rate limited), the
      // profile save should still go through — the embedding just stays
      // as-is until the next successful edit.
      try {
        data.embedding = await generateProfileEmbedding(mergedProfile);
      } catch (embeddingError) {
        console.error("Embedding generation failed, saving profile without updating it:", embeddingError.message);
      }
    }

    // Apply the update to the allowed fields
    const user = await User.findByIdAndUpdate(_id, data, {
      new: true,
      runValidators: true,
    });
    req.user = user;
  }
  catch (error) {
    throw new Error("Error updating user: " + error.message);
  }
};

module.exports = {
  validationSignUpData,
  loginValidation,
  profileEditValidation,
};
