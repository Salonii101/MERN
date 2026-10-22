import dotenv from "dotenv";
dotenv.config();
import { GoogleGenAI } from "@google/genai";

async function listModels() {
  const client = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
  const res = await client.models.list({ pageSize: 50 });
  console.log(res.models.map(m => m.name));
}
listModels();
