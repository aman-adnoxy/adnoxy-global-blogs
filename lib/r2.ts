import { S3Client } from '@aws-sdk/client-s3';

// Cloudflare R2 Credentials
const accountId = import.meta.env?.VITE_R2_ACCOUNT_ID || process.env.VITE_R2_ACCOUNT_ID;
const accessKeyId = import.meta.env?.VITE_R2_ACCESS_KEY_ID || process.env.VITE_R2_ACCESS_KEY_ID;
const secretAccessKey = import.meta.env?.VITE_R2_SECRET_ACCESS_KEY || process.env.VITE_R2_SECRET_ACCESS_KEY;

export const isR2Configured = Boolean(accountId && accessKeyId && secretAccessKey);

export const r2Client = new S3Client({
  region: 'auto',
  endpoint: `https://${accountId}.r2.cloudflarestorage.com`,
  credentials: {
    accessKeyId: accessKeyId || '',
    secretAccessKey: secretAccessKey || '',
  },
});

export const BUCKETS = {
  POSTS: 'blog-markdown',
  IMAGES: 'blog-images',
};
