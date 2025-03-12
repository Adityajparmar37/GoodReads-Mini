export const createUserInput = (userPrompt, title, author, genre) => {
  let input = `BOOK DETAILS:\nTitle: ${title}\nAuthor: ${author}\n`;

  if (userPrompt && userPrompt.trim() !== "") {
    input += `\nREADER THOUGHTS: ${userPrompt}`;
  }

  input += "\n\nPlease generate a concise book review based on these details.";

  return input;
};
