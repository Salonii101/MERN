// routes/scanRouter.js
import express from "express";
import multer from "multer";
import { optionalAuth } from "../middlewares/authMiddleware.js";
import {
  scanFile,
  scanUrl,
  getAnalysis,
  aiInference,
} from "../controllers/scanController.js";

const router = express.Router();
const upload = multer({
  dest: "uploads/",
  limits: { fileSize: 32 * 1024 * 1024 }, // 32MB max scan size
});

// File scan
router.post("/file", optionalAuth, upload.single("file"), scanFile);

// URL scan
router.post("/url", optionalAuth, scanUrl);

// Fetch analysis results & AI review
router.get("/analysis/:id", optionalAuth, getAnalysis);

// AI model inference
router.post("/ai", optionalAuth, upload.single("file"), aiInference);

export default router;