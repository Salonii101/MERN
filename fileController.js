import fs from "fs";
import path from "path";
import axios from "axios";
import { v2 as cloudinary } from "cloudinary";
import s3 from "../config/aws.config.js";
import { File } from "../models/fileMeta.model.js";
import { encryptBuffer, decryptBuffer } from "../utils/encrypt.util.js";
import { PutObjectCommand, GetObjectCommand, DeleteObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";

// Ensure Cloudinary is configured
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLIENT_NAME,
  api_key: process.env.CLOUDINARY_CLIENT_API ,
  api_secret: process.env.CLOUDINARY_CLIENT_SECRET,
});

/**
 * POST /api/v1/files/upload
 * Supports storageProvider: 'cloudinary' | 's3' (default: 'cloudinary')
 * Supports encrypt: boolean (default: true)
 */
export const fileUploadController = async (req, res) => {
  const tempFilesToClean = [];

  try {
    if (!req.file) {
      return res.status(400).json({ success: false, error: "No file uploaded" });
    }

    const file = req.file;
    const tempFilePath = file.path;
    tempFilesToClean.push(tempFilePath);

    const storageProvider = (req.body.storageProvider || "cloudinary").toLowerCase();
    const shouldEncrypt = req.body.isEncrypted !== "false" && req.body.isEncrypted !== false;
    const customPassword = req.body.password || process.env.ENCRYPT_PASSWORD;

    let fileBuffer = fs.readFileSync(tempFilePath);
    let encryptionMeta = null;
    let storedFilename = `${Date.now()}-${file.originalname.replace(/[^a-zA-Z0-9._-]/g, "_")}`;

    if (shouldEncrypt) {
      const encrypted = encryptBuffer(fileBuffer, customPassword);
      fileBuffer = encrypted.combinedBuffer;
      storedFilename += ".enc";
      encryptionMeta = {
        saltHex: encrypted.saltHex,
        ivHex: encrypted.ivHex,
        authTagHex: encrypted.authTagHex,
      };
    }

    let publicId = "";
    let secureUrl = "";
    let s3Key = "";
    let s3Url = "";

    // -------------------------------------------------------------
    // Option A: Cloudinary Storage
    // -------------------------------------------------------------
    if (storageProvider === "cloudinary" && (!process.env.AWS_KEY || !process.env.AWS_SECRET)) {
      const encTempPath = tempFilePath + (shouldEncrypt ? ".enc" : "");
      fs.writeFileSync(encTempPath, fileBuffer);
      tempFilesToClean.push(encTempPath);

      const uploadResult = await cloudinary.uploader.upload(encTempPath, {
        folder: "SafeNet_Secure_Vault",
        resource_type: "raw", // Handles all file types including encrypted binaries
        public_id: storedFilename,
      });

      publicId = uploadResult.public_id;
      secureUrl = uploadResult.secure_url;
    } 
    // -------------------------------------------------------------
    // Option B: AWS S3 Storage
    // -------------------------------------------------------------
    else if (storageProvider === "s3") {
      s3Key = `safenet-vault/${storedFilename}`;
      const bucketName = process.env.S3_BUCKET || "safenet-bucket";

      const putCommand = new PutObjectCommand({
        Bucket: bucketName,
        Key: s3Key,
        Body: fileBuffer,
        ContentType: shouldEncrypt ? "application/octet-stream" : file.mimetype,
      });

      await s3.send(putCommand);
      s3Url = `https://${bucketName}.s3.${process.env.AWS_REGION || "us-east-1"}.amazonaws.com/${s3Key}`;
    }

    // Save record to DB
    const newFile = await File.create({
      filename: storedFilename,
      originalName: file.originalname,
      storedName: storedFilename,
      size: fileBuffer.length,
      mimeType: file.mimetype,
      storageProvider: storageProvider === "s3" && process.env.AWS_KEY ? "s3" : "cloudinary",
      publicId,
      secureUrl,
      s3Key,
      s3Bucket: process.env.S3_BUCKET,
      s3Url,
      isEncrypted: shouldEncrypt,
      encryptionDetails: encryptionMeta,
      owner: req.user?._id || null,
      uploaderName: req.user?.name || "SafeNet User",
    });

    return res.status(201).json({
      success: true,
      message: `File uploaded & ${shouldEncrypt ? "AES-256 encrypted" : "stored"} successfully via ${newFile.storageProvider.toUpperCase()}!`,
      file: newFile,
    });
  } catch (err) {
    console.error("File upload controller error:", err);
    return res.status(500).json({
      success: false,
      error: "File upload failed",
      details: err.message,
    });
  } finally {
    // Safe cleanup of temp files
    tempFilesToClean.forEach((filePath) => {
      try {
        if (fs.existsSync(filePath)) {
          fs.unlinkSync(filePath);
        }
      } catch (cleanErr) {
        console.error("Temp file cleanup error:", cleanErr.message);
      }
    });
  }
};

/**
 * GET /api/v1/files/my-files
 * Returns user files or all vault files if public demo
 */
export const getUserFiles = async (req, res) => {
  try {
    const filter = req.user ? { $or: [{ owner: req.user._id }, { owner: null }] } : {};
    const files = await File.find(filter).sort({ createdAt: -1 });

    return res.status(200).json({
      success: true,
      count: files.length,
      files,
    });
  } catch (err) {
    console.error("Get files error:", err);
    return res.status(500).json({ success: false, error: "Failed to retrieve files" });
  }
};

/**
 * GET /api/v1/files/download/:id
 * Securely downloads and decrypts the file on-the-fly
 */
export const downloadFileController = async (req, res) => {
  try {
    const { id } = req.params;
    const fileDoc = await File.findById(id);

    if (!fileDoc) {
      return res.status(404).json({ success: false, error: "File not found" });
    }

    let rawBuffer = null;

    // Fetch file buffer from Cloudinary or S3
    if (fileDoc.storageProvider === "cloudinary") {
      const response = await axios.get(fileDoc.secureUrl, { responseType: "arraybuffer" });
      rawBuffer = Buffer.from(response.data);
    } else if (fileDoc.storageProvider === "s3") {
      const getCommand = new GetObjectCommand({
        Bucket: fileDoc.s3Bucket || process.env.S3_BUCKET,
        Key: fileDoc.s3Key,
      });
      const s3Response = await s3.send(getCommand);
      const streamToBuffer = async (stream) => {
        return new Promise((resolve, reject) => {
          const chunks = [];
          stream.on("data", (chunk) => chunks.push(chunk));
          stream.on("error", reject);
          stream.on("end", () => resolve(Buffer.concat(chunks)));
        });
      };
      rawBuffer = await streamToBuffer(s3Response.Body);
    }

    if (!rawBuffer) {
      return res.status(500).json({ success: false, error: "Unable to retrieve file data" });
    }

    let finalBuffer = rawBuffer;

    // Decrypt if encrypted
    if (fileDoc.isEncrypted) {
      try {
        finalBuffer = decryptBuffer(rawBuffer, req.query.password || process.env.ENCRYPT_PASSWORD);
      } catch (decErr) {
        console.error("Decryption failed on download:", decErr.message);
        return res.status(400).json({
          success: false,
          error: "Decryption failed. Please check encryption key/password.",
        });
      }
    }

    res.setHeader("Content-Disposition", `attachment; filename="${encodeURIComponent(fileDoc.originalName)}"`);
    res.setHeader("Content-Type", fileDoc.mimeType || "application/octet-stream");
    res.setHeader("Content-Length", finalBuffer.length);

    return res.send(finalBuffer);
  } catch (err) {
    console.error("File download error:", err);
    return res.status(500).json({ success: false, error: "File download failed", details: err.message });
  }
};

/**
 * DELETE /api/v1/files/:id
 * Deletes file from storage and database
 */
export const deleteFileController = async (req, res) => {
  try {
    const { id } = req.params;
    const fileDoc = await File.findById(id);

    if (!fileDoc) {
      return res.status(404).json({ success: false, error: "File not found" });
    }

    if (fileDoc.storageProvider === "cloudinary" && fileDoc.publicId) {
      try {
        await cloudinary.uploader.destroy(fileDoc.publicId, { resource_type: "raw" });
      } catch (cErr) {
        console.error("Cloudinary delete warning:", cErr.message);
      }
    } else if (fileDoc.storageProvider === "s3" && fileDoc.s3Key) {
      try {
        const delCommand = new DeleteObjectCommand({
          Bucket: fileDoc.s3Bucket || process.env.S3_BUCKET,
          Key: fileDoc.s3Key,
        });
        await s3.send(delCommand);
      } catch (sErr) {
        console.error("S3 delete warning:", sErr.message);
      }
    }

    await File.findByIdAndDelete(id);

    return res.status(200).json({
      success: true,
      message: "File deleted successfully from vault and cloud storage",
    });
  } catch (err) {
    console.error("Delete file error:", err);
    return res.status(500).json({ success: false, error: "Failed to delete file" });
  }
};

export default fileUploadController;
