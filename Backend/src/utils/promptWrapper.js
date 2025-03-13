export const createUserInputForBookReview = (
  userPrompt,
  title,
  author,
  genres,
  description
) => {
  let input = `BOOK DETAILS:\nTitle: ${title}\nAuthor: ${author}\n`;

  if (genres && Array.isArray(genres) && genres.length > 0) {
    input += `Genres: ${genres.join(", ")}\n`;
  }

  // If user prompt is available, add it
  if (userPrompt && userPrompt.trim() !== "") {
    input += `\nREADER THOUGHTS: ${userPrompt}`;
  }
  // Otherwise, use the description if available
  else if (description) {
    input += `\nBOOK DESCRIPTION: ${description}`;
  }
  input += "\n\nPlease generate a concise book review based on these details.";

  return input;
};
