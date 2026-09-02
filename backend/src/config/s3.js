const { S3Client } = require("@aws-sdk/client-s3");

// Credentials are NOT read from .env — the SDK's default credential provider
// chain picks them up automatically from ~/.aws/credentials (or env vars,
// or an IAM role, depending on where this runs).
const s3Client = new S3Client({
  region: process.env.AWS_REGION,
});

module.exports = { s3Client };
