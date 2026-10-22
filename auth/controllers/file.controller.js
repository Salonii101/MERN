import fs from "fs";
import axios from "axios";
import { v2 as cloudinary } from "cloudinary";

import s3 from "../config/aws.config.js";
import { File } from "../models/fileMeta.model.js";

import {
  encryptBuffer,
  decryptBuffer,
} from "../utils/encrypt.util.js";

import {
  PutObjectCommand,
  GetObjectCommand,
  DeleteObjectCommand,
} from "@aws-sdk/client-s3";


// ============================================================
// CLOUDINARY CONFIGURATION
// ============================================================

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLIENT_NAME,
  api_key: process.env.CLOUDINARY_CLIENT_API,
  api_secret: process.env.CLOUDINARY_CLIENT_SECRET,
});


// ============================================================
// FILE UPLOAD CONTROLLER
// POST /api/v1/files/upload
// ============================================================

export const fileUploadController = async (req, res) => {
  const tempFilesToClean = [];

  try {
    // ----------------------------------------------------------
    // 1. CHECK FILE
    // ----------------------------------------------------------

    if (!req.file) {
      return res.status(400).json({
        success: false,
        error: "No file uploaded",
      });
    }

    const file = req.file;
    const tempFilePath = file.path;

    tempFilesToClean.push(tempFilePath);


    // ----------------------------------------------------------
    // 2. STORAGE PROVIDER
    // ----------------------------------------------------------

    const storageProvider = (
      req.body.storageProvider || "cloudinary"
    ).toLowerCase();

    if (
      storageProvider !== "cloudinary" &&
      storageProvider !== "s3"
    ) {
      return res.status(400).json({
        success: false,
        error: "Invalid storage provider. Use cloudinary or s3.",
      });
    }


    // ----------------------------------------------------------
    // 3. ENCRYPTION SETTINGS
    // ----------------------------------------------------------

    const shouldEncrypt =
      req.body.isEncrypted !== "false" &&
      req.body.isEncrypted !== false;

    const encryptionPassword =
      req.body.password ||
      process.env.ENCRYPT_PASSWORD;

    if (shouldEncrypt && !encryptionPassword) {
      return res.status(500).json({
        success: false,
        error:
          "Encryption password is missing. Add ENCRYPT_PASSWORD to your .env file.",
      });
    }


    // ----------------------------------------------------------
    // 4. READ TEMPORARY FILE
    // ----------------------------------------------------------

    let fileBuffer = fs.readFileSync(tempFilePath);


    // ----------------------------------------------------------
    // 5. GENERATE STORED FILENAME
    // ----------------------------------------------------------

    const safeOriginalName =
      file.originalname.replace(
        /[^a-zA-Z0-9._-]/g,
        "_"
      );

    let storedFilename =
      `${Date.now()}-${safeOriginalName}`;


    // ----------------------------------------------------------
    // 6. ENCRYPT FILE
    // ----------------------------------------------------------

    let encryptionDetails = null;

    if (shouldEncrypt) {
      console.log(
        `Encrypting file: ${file.originalname}`
      );

      const encrypted = encryptBuffer(
        fileBuffer,
        encryptionPassword
      );

      fileBuffer = encrypted.combinedBuffer;

      storedFilename += ".enc";

      encryptionDetails = {
        saltHex: encrypted.saltHex,
        ivHex: encrypted.ivHex,
        authTagHex: encrypted.authTagHex,
      };

      console.log("File encryption completed.");
    }


    // ----------------------------------------------------------
    // 7. STORAGE VARIABLES
    // ----------------------------------------------------------

    let publicId = "";
    let secureUrl = "";

    let s3Key = "";
    let s3Url = "";

    let actualStorageProvider = storageProvider;


    // ==========================================================
    // 8. CLOUDINARY STORAGE
    // ==========================================================

    if (storageProvider === "cloudinary") {

      console.log(
        `Uploading ${storedFilename} to Cloudinary...`
      );


      // --------------------------------------------------------
      // Check Cloudinary configuration
      // --------------------------------------------------------

      if (
        !process.env.CLOUDINARY_CLIENT_NAME ||
        !process.env.CLOUDINARY_CLIENT_API ||
        !process.env.CLOUDINARY_CLIENT_SECRET
      ) {
        return res.status(500).json({
          success: false,
          error:
            "Cloudinary configuration is incomplete. Check your .env file.",
        });
      }


      // --------------------------------------------------------
      // Create temporary encrypted file
      // --------------------------------------------------------

      const uploadTempPath =
        `${tempFilePath}.upload`;

      fs.writeFileSync(
        uploadTempPath,
        fileBuffer
      );

      tempFilesToClean.push(uploadTempPath);


      // --------------------------------------------------------
      // Upload to Cloudinary
      // --------------------------------------------------------

      try {

        const uploadResult =
          await cloudinary.uploader.upload(
            uploadTempPath,
            {
              folder: "SafeNet_Secure_Vault",

              // Store encrypted files as raw assets
              resource_type: "raw",

              // Unique stored filename
              public_id: storedFilename,
            }
          );


        publicId =
          uploadResult.public_id;

        secureUrl =
          uploadResult.secure_url;


        console.log(
          "Cloudinary upload successful."
        );

        console.log(
          "Public ID:",
          publicId
        );

      } catch (cloudinaryError) {

        console.error(
          "Cloudinary upload failed:",
          cloudinaryError.message
        );

        return res.status(
          cloudinaryError.http_code || 500
        ).json({
          success: false,
          error: "Cloudinary upload failed.",
          details: cloudinaryError.message,
        });
      }
    }


    // ==========================================================
    // 9. AWS S3 STORAGE
    // ==========================================================

    else if (storageProvider === "s3") {

      console.log(
        `Uploading ${storedFilename} to AWS S3...`
      );


      // --------------------------------------------------------
      // Check AWS credentials
      // --------------------------------------------------------

      if (
        !process.env.AWS_KEY ||
        !process.env.AWS_SECRET
      ) {
        return res.status(500).json({
          success: false,
          error:
            "AWS credentials are missing. Add AWS_KEY and AWS_SECRET to .env.",
        });
      }


      // --------------------------------------------------------
      // Check S3 bucket
      // --------------------------------------------------------

      const bucketName =
        process.env.S3_BUCKET;

      if (!bucketName) {
        return res.status(500).json({
          success: false,
          error:
            "S3_BUCKET is missing from .env.",
        });
      }


      // --------------------------------------------------------
      // Create S3 object key
      // --------------------------------------------------------

      s3Key =
        `safenet-vault/${storedFilename}`;


      // --------------------------------------------------------
      // Upload to S3
      // --------------------------------------------------------

      const putCommand =
        new PutObjectCommand({
          Bucket: bucketName,

          Key: s3Key,

          Body: fileBuffer,

          ContentType:
            shouldEncrypt
              ? "application/octet-stream"
              : file.mimetype,
        });


      await s3.send(
        putCommand
      );


      // --------------------------------------------------------
      // Generate S3 URL
      // --------------------------------------------------------

      s3Url =
        `https://${bucketName}.s3.${
          process.env.AWS_REGION || "us-east-1"
        }.amazonaws.com/${s3Key}`;


      console.log(
        "S3 upload successful."
      );

      console.log(
        "S3 Key:",
        s3Key
      );
    }


    // ==========================================================
    // 10. SAVE FILE METADATA TO MONGODB
    // ==========================================================

    const newFile =
      await File.create({

        // Stored filename
        filename: storedFilename,

        // Original filename
        originalName: file.originalname,

        // Stored filename
        storedName: storedFilename,

        // Size of encrypted/stored data
        size: fileBuffer.length,

        // Original MIME type
        mimeType: file.mimetype,

        // Actual storage provider
        storageProvider:
          actualStorageProvider,

        // Cloudinary information
        publicId,

        secureUrl,

        // S3 information
        s3Key,

        s3Bucket:
          process.env.S3_BUCKET || "",

        s3Url,

        // Encryption information
        isEncrypted:
          shouldEncrypt,

        encryptionDetails,

        // User information
        owner:
          req.user?._id || null,

        uploaderName:
          req.user?.name ||
          "SafeNet User",
      });


    // ==========================================================
    // 11. SUCCESS RESPONSE
    // ==========================================================

    return res.status(201).json({

      success: true,

      message:
        `File uploaded & ${
          shouldEncrypt
            ? "AES-256 encrypted"
            : "stored"
        } successfully via ${actualStorageProvider.toUpperCase()}!`,

      file: newFile,
    });


  } catch (err) {

    console.error(
      "File upload controller error:",
      err
    );

    return res.status(500).json({

      success: false,

      error: "File upload failed",

      details: err.message,
    });


  } finally {

    // ----------------------------------------------------------
    // CLEAN TEMPORARY FILES
    // ----------------------------------------------------------

    tempFilesToClean.forEach(
      (filePath) => {

        try {

          if (fs.existsSync(filePath)) {
            fs.unlinkSync(filePath);
          }

        } catch (cleanErr) {

          console.error(
            "Temporary file cleanup error:",
            cleanErr.message
          );
        }
      }
    );
  }
};


// ============================================================
// GET USER FILES
// GET /api/v1/files/my-files
// ============================================================

export const getUserFiles = async (
  req,
  res
) => {

  try {

    const files =
      await File.find({
        owner: req.user?._id,
      }).sort({
        createdAt: -1,
      });


    return res.status(200).json({

      success: true,

      count: files.length,

      files,
    });


  } catch (err) {

    console.error(
      "Get user files error:",
      err
    );

    return res.status(500).json({

      success: false,

      error: "Unable to fetch files",

      details: err.message,
    });
  }
};


// ============================================================
// DOWNLOAD FILE
// GET /api/v1/files/download/:id
// ============================================================

export const downloadFileController =
  async (req, res) => {

    try {

      const { id } =
        req.params;


      // --------------------------------------------------------
      // Find file metadata
      // --------------------------------------------------------

      const fileDoc =
        await File.findById(id);


      if (!fileDoc) {

        return res.status(404).json({

          success: false,

          error: "File not found",
        });
      }


      let downloadedBuffer;


      // ========================================================
      // CLOUDINARY DOWNLOAD
      // ========================================================

      if (
        fileDoc.storageProvider ===
        "cloudinary"
      ) {

        if (!fileDoc.secureUrl) {

          return res.status(404).json({

            success: false,

            error:
              "Cloudinary file URL not found.",
          });
        }


        console.log(
          "Downloading file from Cloudinary..."
        );


        const response =
          await axios.get(
            fileDoc.secureUrl,
            {
              responseType:
                "arraybuffer",
            }
          );


        downloadedBuffer =
          Buffer.from(
            response.data
          );
      }


      // ========================================================
      // AWS S3 DOWNLOAD
      // ========================================================

      else if (
        fileDoc.storageProvider ===
        "s3"
      ) {

        if (
          !fileDoc.s3Bucket ||
          !fileDoc.s3Key
        ) {

          return res.status(404).json({

            success: false,

            error:
              "S3 file information not found.",
          });
        }


        const getCommand =
          new GetObjectCommand({

            Bucket:
              fileDoc.s3Bucket,

            Key:
              fileDoc.s3Key,
          });


        const response =
          await s3.send(
            getCommand
          );


        const chunks = [];


        for await (
          const chunk of response.Body
        ) {
          chunks.push(chunk);
        }


        downloadedBuffer =
          Buffer.concat(chunks);
      }


      // ========================================================
      // UNKNOWN STORAGE PROVIDER
      // ========================================================

      else {

        return res.status(500).json({

          success: false,

          error:
            "Unknown storage provider.",
        });
      }


      // --------------------------------------------------------
      // Check downloaded data
      // --------------------------------------------------------

      if (!downloadedBuffer) {

        return res.status(500).json({

          success: false,

          error:
            "Unable to retrieve file data.",
        });
      }


      // ========================================================
      // DECRYPT FILE
      // ========================================================

      let finalBuffer =
        downloadedBuffer;


      if (
        fileDoc.isEncrypted &&
        fileDoc.encryptionDetails
      ) {

        const password =
          req.query.password ||
          process.env.ENCRYPT_PASSWORD;


        if (!password) {

          return res.status(500).json({

            success: false,

            error:
              "Encryption password is missing.",
          });
        }


        try {

          console.log(
            "Decrypting downloaded file..."
          );


          finalBuffer =
            decryptBuffer(
              downloadedBuffer,
              password,
              fileDoc.encryptionDetails
            );

        } catch (decryptError) {

          console.error(
            "Decryption failed:",
            decryptError.message
          );

          return res.status(400).json({

            success: false,

            error:
              "Decryption failed. Please check the encryption password.",
          });
        }
      }


      // ========================================================
      // SEND ORIGINAL FILE
      // ========================================================

      res.setHeader(
        "Content-Type",
        fileDoc.mimeType ||
          "application/octet-stream"
      );


      res.setHeader(
        "Content-Disposition",
        `attachment; filename="${encodeURIComponent(
          fileDoc.originalName
        )}"`
      );


      res.setHeader(
        "Content-Length",
        finalBuffer.length
      );


      return res.send(
        finalBuffer
      );


    } catch (err) {

      console.error(
        "File download error:",
        err
      );

      return res.status(500).json({

        success: false,

        error:
          "File download failed",

        details:
          err.message,
      });
    }
  };


// ============================================================
// DELETE FILE
// DELETE /api/v1/files/:id
// ============================================================

export const deleteFileController =
  async (req, res) => {

    try {

      const { id } =
        req.params;


      // --------------------------------------------------------
      // Find file metadata
      // --------------------------------------------------------

      const fileDoc =
        await File.findById(id);


      if (!fileDoc) {

        return res.status(404).json({

          success: false,

          error: "File not found",
        });
      }


      // ========================================================
      // DELETE FROM CLOUDINARY
      // ========================================================

      if (
        fileDoc.storageProvider ===
        "cloudinary"
      ) {

        if (fileDoc.publicId) {

          console.log(
            "Deleting file from Cloudinary..."
          );


          try {

            await cloudinary.uploader.destroy(
              fileDoc.publicId,
              {
                resource_type: "raw",
              }
            );

          } catch (cloudinaryError) {

            console.error(
              "Cloudinary delete error:",
              cloudinaryError.message
            );

            return res.status(500).json({

              success: false,

              error:
                "Failed to delete file from Cloudinary.",
            });
          }
        }
      }


      // ========================================================
      // DELETE FROM AWS S3
      // ========================================================

      else if (
        fileDoc.storageProvider ===
        "s3"
      ) {

        if (
          fileDoc.s3Bucket &&
          fileDoc.s3Key
        ) {

          console.log(
            "Deleting file from S3..."
          );


          try {

            const deleteCommand =
              new DeleteObjectCommand({

                Bucket:
                  fileDoc.s3Bucket,

                Key:
                  fileDoc.s3Key,
              });


            await s3.send(
              deleteCommand
            );

          } catch (s3Error) {

            console.error(
              "S3 delete error:",
              s3Error.message
            );

            return res.status(500).json({

              success: false,

              error:
                "Failed to delete file from S3.",
            });
          }
        }
      }


      // ========================================================
      // DELETE MONGODB METADATA
      // ========================================================

      await File.findByIdAndDelete(id);


      // ========================================================
      // SUCCESS
      // ========================================================

      return res.status(200).json({

        success: true,

        message:
          "File deleted successfully from vault and cloud storage.",
      });


    } catch (err) {

      console.error(
        "Delete file error:",
        err
      );

      return res.status(500).json({

        success: false,

        error:
          "File deletion failed",

        details:
          err.message,
      });
    }
  };


// ============================================================
// DEFAULT EXPORT
// ============================================================

export default fileUploadController;