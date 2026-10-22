const express = require("express");
const multer = require("multer");
const fs = require("fs");
const path = require("path");
const axios = require("axios");
const FormData = require("form-data");

const router = express.Router();
const upload = multer({ dest: "uploads/" });
require("dotenv").config();

const API_KEY = process.env.VIRUSTOTAL_API_KEY;

// -------------------- FILE SCAN --------------------
router.post("/scan-file", upload.single("file"), async (req, res) => {
  console.log("📥 Received file upload:", req.file);

  try {
    if (!API_KEY) {
      console.error("❌ VirusTotal API key missing!");
      return res.status(500).json({ error: "API key missing on server" });
    }

    if (!req.file) {
      console.error("❌ No file uploaded!");
      return res.status(400).json({ error: "No file uploaded" });
    }

    const filePath = path.resolve(req.file.path);
    console.log("📂 Upload path:", filePath);

    const form = new FormData();
    form.append("file", fs.createReadStream(filePath));

    console.log("🚀 Uploading file to VirusTotal...");

    let response;
    let attempts = 0;
    const maxAttempts = 3;

    while (attempts < maxAttempts) {
      try {
        response = await axios.post(
          "https://www.virustotal.com/api/v3/files",
          form,
          {
            headers: {
              "x-apikey": API_KEY,
              ...form.getHeaders(),
            },
            maxBodyLength: Infinity,
            maxContentLength: Infinity,
          }
        );
        break; // success
      } catch (err) {
        attempts++;
        if (err.response?.status === 409 && attempts < maxAttempts) {
          console.warn(
            `⚠️ 409 Conflict — retrying upload (Attempt ${attempts}/${maxAttempts})`
          );
          await new Promise((r) => setTimeout(r, 2000)); // wait 2s before retry
          continue;
        }
        throw err; // other errors
      }
    }

    if (!response) throw new Error("Failed to upload after retries");

    console.log("✅ VirusTotal response received:", response.data);

    // cleanup temporary file
    fs.unlinkSync(filePath);

    return res.json({ analysis_id: response.data.data.id });
  } catch (err) {
    console.error("🔥 scan-file error message:", err.message);
    console.error("🔥 scan-file error response:", err.response?.data);
    console.error("🔥 scan-file full stack:", err.stack);

    try {
      if (req.file && fs.existsSync(req.file.path))
        fs.unlinkSync(req.file.path);
    } catch (cleanupErr) {
      console.warn("⚠️ File cleanup failed:", cleanupErr.message);
    }

    const message =
      err.response?.data?.error?.message ||
      err.response?.data ||
      err.message ||
      "Internal Server Error";

    return res.status(500).json({ error: message });
  }
});

// -------------------- URL SCAN --------------------
router.post("/scan-url", async (req, res) => {
  try {
    if (!API_KEY) {
      console.error("❌ VirusTotal API key missing!");
      return res.status(500).json({ error: "API key missing on server" });
    }

    const { url } = req.body;
    if (!url) return res.status(400).json({ error: "URL missing" });

    console.log("🌐 Scanning URL:", url);

    const response = await axios.post(
      "https://www.virustotal.com/api/v3/urls",
      new URLSearchParams({ url }),
      {
        headers: {
          "x-apikey": API_KEY,
          "Content-Type": "application/x-www-form-urlencoded",
        },
      }
    );

    console.log("✅ VirusTotal URL scan response:", response.data);
    return res.json({ analysis_id: response.data.data.id });
  } catch (err) {
    console.error("🔥 scan-url error message:", err.message);
    console.error("🔥 scan-url error response:", err.response?.data);
    return res.status(500).json({
      error: err.response?.data || err.message || "Internal Server Error",
    });
  }
});

// -------------------- GET RESULT --------------------
router.get("/scan-result/:id", async (req, res) => {
  try {
    if (!API_KEY) {
      console.error("❌ VirusTotal API key missing!");
      return res.status(500).json({ error: "API key missing on server" });
    }

    const { id } = req.params;
    console.log("🔎 Fetching results for:", id);

    const response = await axios.get(
      `https://www.virustotal.com/api/v3/analyses/${id}`,
      {
        headers: { "x-apikey": API_KEY },
      }
    );

    return res.json(response.data);
  } catch (err) {
    console.error("🔥 scan-result error message:", err.message);
    console.error("🔥 scan-result error response:", err.response?.data);
    return res.status(500).json({
      error: err.response?.data || err.message || "Internal Server Error",
    });
  }
});

module.exports = router;
