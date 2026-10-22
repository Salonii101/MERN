import dotenv from "dotenv";
import { S3Client } from "@aws-sdk/client-s3";

// Load environment variables
dotenv.config();

console.log(process.env.AWS_REGION);

// Create an S3 client
const s3 = new S3Client({
  region: process.env.AWS_REGION,
  credentials: {
    accessKeyId: process.env.AWS_KEY,
    secretAccessKey: process.env.AWS_SECRET,
  },
});

export default s3;
