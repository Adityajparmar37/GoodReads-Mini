import { geminiModel } from "../config/geminiAI.js";

const THRESHOLDS_FOR_REVIEW = {
  RELEVANCE: 0.8,
};

const GENERATED_REVIEW_WORD_LIMIT = 100;

export const checkReviewPromptRelevance = async (userInput) => {
  try {
    const prompt = `
Task: Rate how relevant these reader thoughts are to the book details provided.
${userInput}

Rate relevance on a scale of 0-10 where:
0-3: Not relevant at all
4-6: Somewhat relevant
7-10: Very relevant

Use your history 

Provide only the numeric rating and nothing else at all:`;

    const chatSession = geminiModel.startChat();
    const result = await chatSession.sendMessage(prompt);
    const responseText = result.response.text().trim();
    const match = responseText.match(/(\d+)/);

    if (match) {
      const rating = parseInt(match[1], 10) / 10; // Convert to 0-1 scale
      return {
        success: rating >= THRESHOLDS_FOR_REVIEW.RELEVANCE,
        score: rating,
      };
    }

    // Default to success if we can't parse
    return { success: true, score: 0.5 };
  } catch (e) {
    console.error("Error checking relevance:", e);
    return { success: true, score: 0.5 }; // Default to success on error
  }
};

export const generateReview = async (userInput, hasUserPrompt) => {
  try {
    const prompt = `
${userInput}

${
  hasUserPrompt
    ? "Analyze the sentiment in the reader's thoughts and generate a book review that reflects their perspective."
    : "Generate a book review based on the book details and description provided."
}

Requirements:
1. Aim for a review around ${GENERATED_REVIEW_WORD_LIMIT} words
2. Plain text format only, no markdown
3. No special characters like quotes, backticks, or slashes
4. No introductory phrases like "Here is the review" or "The review is"
5. No closing phrases or asking for feedback
6. Direct assessment of the book only
7. Complete sentences only, no partial statements
8. No HTML tags

Your review (return only the review text and nothing else):`;

    const chatSession = geminiModel.startChat();
    const result = await chatSession.sendMessage(prompt);
    const review = result.response.text().trim();

    return {
      success: review && review.length >= 10,
      review: review,
    };
  } catch (e) {
    console.error("Error generating review:", e);
    return { success: false };
  }
};

export const processGenerateReviewResponse = async (review) => {
  if (!review) return "";

  let processed = review.replace(/<[^>]*>/g, "");

  processed = processed.replace(
    /^(here is|here's|the review is|review:|the following is|I would write:|my review:).+?(?=\w{2,}\.)/i,
    ""
  );

  processed = processed.replace(
    /(\.|!|\?)(\s+)(thank you|hope this helps|let me know|does this work|feel free|feedback|right).+$/i,
    "$1"
  );

  processed = processed.replace(/[`'"\\]/g, "");
  processed = processed.trim();

  const words = processed.split(/\s+/);
  if (words.length > GENERATED_REVIEW_WORD_LIMIT) {
    const limitedText = words.slice(0, GENERATED_REVIEW_WORD_LIMIT).join(" ");
    const lastSentenceMatch = limitedText.match(/^(.+?[.!?])(?:\s|$)/);

    if (lastSentenceMatch) {
      processed = lastSentenceMatch[1];
    } else {
      processed = limitedText;
    }
  }

  return processed;
};
