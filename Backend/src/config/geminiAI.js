import { GoogleGenerativeAI } from "@google/generative-ai";
import { generateReviewAiHistory } from "../utils/systemInstruction.js";

export const geminiInstance = new GoogleGenerativeAI(
  process.env.GEMINI_API_KEY
);

export const geminiModel = geminiInstance.getGenerativeModel({
  model: "gemini-2.0-flash-thinking-exp-01-21",
  history: generateReviewAiHistory,
});

export const generationConfig = {
  temperature: 0.7,
  topP: 0.95,
  topK: 64,
  maxOutputTokens: 65536,
  responseMimeType: "text/plain",
};
