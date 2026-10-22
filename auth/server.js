import dotenv from "dotenv";
dotenv.config();

import mongoose from "mongoose";
import { app } from "./app.js";
import { v2 as cloudinary } from "cloudinary";

// Cloudinary Config
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLIENT_NAME,
  api_key: process.env.CLOUDINARY_CLIENT_API,
  api_secret: process.env.CLOUDINARY_CLIENT_SECRET,
});

console.log("Dev Environment");

mongoose
  .connect(process.env.MONGO_URI) // ✅ Correct variable name
  .then(() => {
    console.log("✅ Database Connected Successfully");

    app.listen(process.env.PORT || 5000, () => {
      console.log(`🚀 Server running on port ${process.env.PORT || 5000}`);
    });
  })
  .catch((err) => {
    console.error("❌ MongoDB Connection Error:", err.message);
  });
