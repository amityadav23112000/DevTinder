// One-time setup script: creates the S3 bucket used for profile images.
// Run manually with: node scripts/create-s3-bucket.js
require("dotenv").config();
const {
  CreateBucketCommand,
  PutPublicAccessBlockCommand,
  PutBucketCorsCommand,
  HeadBucketCommand,
} = require("@aws-sdk/client-s3");
const { s3Client } = require("../src/config/s3");

const REGION = process.env.AWS_REGION;
const BUCKET_NAME = process.env.S3_BUCKET_NAME;

async function main() {
  if (!BUCKET_NAME) {
    throw new Error("Set S3_BUCKET_NAME in .env before running this script.");
  }

  try {
    await s3Client.send(
      new CreateBucketCommand({
        Bucket: BUCKET_NAME,
        // us-east-1 is the only region that rejects a LocationConstraint
        CreateBucketConfiguration:
          REGION === "us-east-1" ? undefined : { LocationConstraint: REGION },
      })
    );
    console.log(`Created bucket "${BUCKET_NAME}" in ${REGION}.`);
  } catch (error) {
    if (error.name === "BucketAlreadyOwnedByYou") {
      console.log(`Bucket "${BUCKET_NAME}" already exists — skipping creation.`);
    } else {
      throw error;
    }
  }

  // Keep the bucket private by default. Serving strategy (signed URLs vs a
  // public read policy) is a decision for when the upload feature is built.
  await s3Client.send(
    new PutPublicAccessBlockCommand({
      Bucket: BUCKET_NAME,
      PublicAccessBlockConfiguration: {
        BlockPublicAcls: true,
        IgnorePublicAcls: true,
        BlockPublicPolicy: true,
        RestrictPublicBuckets: true,
      },
    })
  );
  console.log("Public access blocked (default-secure).");

  // Presigned PUT uploads are made directly from the browser, so the bucket
  // needs to answer the browser's CORS preflight for that origin.
  await s3Client.send(
    new PutBucketCorsCommand({
      Bucket: BUCKET_NAME,
      CORSConfiguration: {
        CORSRules: [
          {
            AllowedOrigins: ["http://localhost:5173"], // update when deploying elsewhere
            AllowedMethods: ["PUT", "GET"],
            AllowedHeaders: ["*"],
            MaxAgeSeconds: 3000,
          },
        ],
      },
    })
  );
  console.log("CORS policy applied.");

  await s3Client.send(new HeadBucketCommand({ Bucket: BUCKET_NAME }));
  console.log("Verified: bucket is reachable.");
}

main().catch((error) => {
  console.error("Failed to set up S3 bucket:", error.message);
  process.exit(1);
});
