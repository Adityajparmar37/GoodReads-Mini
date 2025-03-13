import {
  checkReviewPromptRelevance,
  generateReview,
  processGenerateReviewResponse,
} from "../utils/checkGeneratedResponsePrompt.js";
import { BOOK_REVIEW_ERROR_MESSAGES } from "../utils/generatedResponsesError.js";

export const geminiServiceReview = async (userInput) => {
  try {
    // Check if user prompt exists and is relevant
    const hasUserPrompt = userInput.includes("READER THOUGHTS:");
    if (hasUserPrompt) {
      const match = userInput.match(/READER THOUGHTS:\s*(.*?)(\n\n|\n*$)/s);
      const userPromptText = match ? match[1].trim() : "";
      if (userPromptText) {
        const relevanceResult = await checkReviewPromptRelevance(userInput);
        if (!relevanceResult.success) {
          return {
            success: false,
            message: BOOK_REVIEW_ERROR_MESSAGES.IRRELEVANT,
          };
        }
      }
    }

    // Generate review
    const generationResult = await generateReview(userInput, hasUserPrompt);
    if (!generationResult.success) {
      return {
        success: false,
        message: BOOK_REVIEW_ERROR_MESSAGES.GENERATION_FAILED,
      };
    }

    // Process review
    const processedResult = await processGenerateReviewResponse(
      generationResult.review
    );
    if (!processedResult) {
      return {
        success: false,
        message: BOOK_REVIEW_ERROR_MESSAGES.PROCESSING_FAILED,
      };
    }

    return { success: true, message: processedResult };
  } catch (error) {
    console.error("Error in gemini service:", error);
    return {
      success: false,
      message: ERROR_MESSAGES.GENERATION_FAILED,
    };
  }
};
