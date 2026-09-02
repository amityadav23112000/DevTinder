const { GetObjectCommand } = require("@aws-sdk/client-s3");
const { getSignedUrl } = require("@aws-sdk/s3-request-presigner");
const { s3Client } = require("../config/s3");

const SIGNED_URL_EXPIRY_SECONDS = 1800; // 30 minutes

// Takes a Mongoose user doc (or plain object) and returns a plain object
// with a fresh signed photoUrl in place of the raw S3 key — the key itself
// is never sent to the client.
const withSignedPhotoUrl = async (userDoc) => {
  if (!userDoc) return userDoc;
  const user = userDoc.toObject ? userDoc.toObject() : { ...userDoc };
  user.photoUrl = user.photoKey
    ? await getSignedUrl(
        s3Client,
        new GetObjectCommand({ Bucket: process.env.S3_BUCKET_NAME, Key: user.photoKey }),
        { expiresIn: SIGNED_URL_EXPIRY_SECONDS }
      )
    : null; // no upload — frontend falls back to a gender-based icon
  delete user.photoKey;
  return user;
};

const withSignedPhotoUrls = (users) => Promise.all(users.map(withSignedPhotoUrl));

module.exports = { withSignedPhotoUrl, withSignedPhotoUrls };
