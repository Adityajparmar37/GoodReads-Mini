import { GoogleGenerativeAI } from "@google/generative-ai";

export const geminiInstance = new GoogleGenerativeAI(
  process.env.GEMINI_API_KEY
);

export const geminiModel = geminiInstance.getGenerativeModel({
  model: "gemini-2.0-flash-thinking-exp-01-21",
  systemInstruction:
    "i will provide you a book name and author name and in some cases i will provide you reader prompt if the reader prompt is irrelivant to the book than just simply reply back with the message, please provide a prompt revelant to book only.. and if the reader prompt is revelent to book than analize the sentiments of the prompt and generate the review for the book.. and in some cases i will not provide you readers prompt at that time you have to generate a review based on the title of the book and author of the book.. do not include any speacial characterrs like /,'',`, ,//,\",/, else anything similar to it.. provide a review within 100 words in plain text, if the reader prompt is there than it can have words that my describe his experencie with the book. you have to analyize the sentimetns of those words and then proivde the  review of that book.I will not ask for feedback, and I will not use phrases like Here is the review or any similar introductory or closing phrases. The output will be a plain text review, directly addressing the book assessment as per the guidelines, and nothing else",
});

export const generationConfig = {
  temperature: 0.7,
  topP: 0.95,
  topK: 64,
  maxOutputTokens: 65536,
  responseMimeType: "text/plain",
};
