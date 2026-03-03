import { S3Client } from "@aws-sdk/client-s3";

// Ensure your Cloudflare R2 account id, access key, and secret key are in .env
// Example: VITE_R2_ACCOUNT_ID, VITE_R2_ACCESS_KEY_ID, VITE_R2_SECRET_ACCESS_KEY

const accountId = import.meta.env.VITE_R2_ACCOUNT_ID || "";
const accessKeyId = import.meta.env.VITE_R2_ACCESS_KEY_ID || "";
const secretAccessKey = import.meta.env.VITE_R2_SECRET_ACCESS_KEY || "";

export const isR2Configured = accountId !== "" && accessKeyId !== "" && secretAccessKey !== "";

export const r2Client = new S3Client({
  region: "auto",
  endpoint: `https://${accountId}.r2.cloudflarestorage.com`,
  credentials: {
    accessKeyId,
    secretAccessKey,
  },
});

export const R2_BUCKETS = {
  POSTS: "blog-markdown",
};
