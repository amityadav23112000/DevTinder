const crypto = require("crypto");
const { PutObjectCommand } = require("@aws-sdk/client-s3");
const { getSignedUrl } = require("@aws-sdk/s3-request-presigner");
const { s3Client } = require("../config/s3");
const { profileEditValidation } = require("../utils/validation");
const { withSignedPhotoUrl } = require("../utils/photoUrl");
const User = require("../models/user");

const ALLOWED_CONTENT_TYPES = {
  "image/jpeg": "jpg",
  "image/png": "png",
  "image/webp": "webp",
};
const UPLOAD_URL_EXPIRY_SECONDS = 300; // 5 minutes — plenty of time to upload

const viewProfile = async (req, res) => {
  try {
    res.send(await withSignedPhotoUrl(req.user));
  } catch (error) {
    res.status(401).send("error" + error);
  }
};

const editProfile = async (req, res) => {
  try {
    // Validate the data before updating
    await profileEditValidation(req);
    res.send(await withSignedPhotoUrl(req.user));
  }
  catch (error) {
    return res.status(400).json({ message: "Error updating user", error: error.message });
  }
};

// Step 1 of a photo upload: hand the client a short-lived URL it can PUT
// the file to directly on S3 — the file bytes never pass through this server.
const presignPhotoUpload = async (req, res) => {
  try {
    const { contentType } = req.body;
    const extension = ALLOWED_CONTENT_TYPES[contentType];
    if (!extension) {
      return res.status(400).json({ message: "Unsupported image type. Use JPEG, PNG, or WebP." });
    }

    // The key is chosen entirely server-side, scoped under the caller's own
    // id — the client never gets to pick where its upload lands.
    const key = `profile-photos/${req.user._id}/${crypto.randomUUID()}.${extension}`;

    const uploadUrl = await getSignedUrl(
      s3Client,
      new PutObjectCommand({
        Bucket: process.env.S3_BUCKET_NAME,
        Key: key,
        ContentType: contentType,
      }),
      { expiresIn: UPLOAD_URL_EXPIRY_SECONDS }
    );

    res.status(200).json({ uploadUrl, key });
  } catch (error) {
    res.status(400).json({ message: "Error creating upload URL", error: error.message });
  }
};

// Step 2: once the browser has PUT the file to S3, tell the backend which
// key to attach to the user's profile.
const confirmPhotoUpload = async (req, res) => {
  try {
    const { photoKey } = req.body;
    // Must be a key we handed out for THIS user — blocks claiming someone else's upload.
    const expectedPrefix = `profile-photos/${req.user._id}/`;
    if (typeof photoKey !== "string" || !photoKey.startsWith(expectedPrefix)) {
      return res.status(400).json({ message: "Invalid photo key" });
    }

    const updatedUser = await User.findByIdAndUpdate(
      req.user._id,
      { photoKey },
      { new: true, runValidators: true }
    );
    res.status(200).json(await withSignedPhotoUrl(updatedUser));
  } catch (error) {
    res.status(400).json({ message: "Error updating photo", error: error.message });
  }
};

module.exports = { viewProfile, editProfile, presignPhotoUpload, confirmPhotoUpload };
