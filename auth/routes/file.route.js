
import express from "express";
import multer from "multer";
import {
  fileUploadController,
  getUserFiles,
  downloadFileController,
  deleteFileController,
} from "../controllers/file.controller.js";

const router = express.Router();

// Multer storage for temporary files with max 50MB file size limit
const upload = multer({
  dest: "temp/",
  limits: { fileSize: 50 * 1024 * 1024 },
});

// Mounted in app.js as app.use('/api/v1/files', fileRoutes)
router.post("/upload", upload.single("file"), fileUploadController);
router.post("/", upload.single("file"), fileUploadController); // fallback alias
router.get("/my-files", getUserFiles);
router.get("/", getUserFiles);
router.get("/download/:id", downloadFileController);
router.delete("/:id", deleteFileController);

export default router;
