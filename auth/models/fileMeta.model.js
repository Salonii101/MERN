
import mongoose from "mongoose";

const fileSchema = new mongoose.Schema(
  {
    filename: { type: String, required: true },
    originalName: { type: String, required: true },
    storedName: { type: String, required: true },
    size: { type: Number, required: true },
    mimeType: { type: String, default: "application/octet-stream" },
    storageProvider: {
      type: String,
      enum: ["cloudinary", "s3", "local"],
      default: "cloudinary",
      required: true,
    },
    // Cloudinary details
    publicId: { type: String },
    secureUrl: { type: String },
    // S3 details
    s3Key: { type: String },
    s3Bucket: { type: String },
    s3Url: { type: String },
    // Security & Encryption
    isEncrypted: { type: Boolean, default: false },
    encryptionDetails: {
      saltHex: String,
      ivHex: String,
      authTagHex: String,
    },
    owner: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: false,
    },
    uploaderName: { type: String, default: "SafeNet User" },
  },
  {
    timestamps: true,
  }
);

export const File = mongoose.models.File || mongoose.model("File", fileSchema);
export default File;
