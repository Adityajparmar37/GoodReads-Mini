import { geminiModel, generationConfig } from "../config/geminiAI.js";

export const geminiService = async (userInput) => {
  const chatSession = geminiModel.startChat({
    generationConfig,
  });

  const result = await chatSession.sendMessage(userInput);
  console.log(result.response.text());
  return result.response.text();
};
