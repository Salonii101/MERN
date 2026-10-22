import "dotenv/config";
import { GoogleGenAI } from "@google/genai";

async function testGemini() {
  try {
    const genAI = new GoogleGenAI({
      apiKey: process.env.GEMINI_API_KEY,
    });

    const result = await genAI.models.generateContent({
      model: "gemini-3.6-flash",
      contents: "Write a one-line motivational quote about perseverance.",
    });

    // ✅ Try all possible response locations
    const textOutput =
      result?.response?.candidates?.[0]?.content?.parts?.[0]?.text ||
      result?.response?.text?.() ||
      result?.output_text ||
      result?.candidates?.[0]?.content?.parts?.[0]?.text ||
      "⚠️ No text found in response.";

    console.log(textOutput.trim());
  } catch (error) {
    console.error("❌ Gemini API test failed:\n", error);
  }
}

testGemini();
