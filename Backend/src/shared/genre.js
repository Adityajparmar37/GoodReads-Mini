export const isValidGenre = (genres) => {
  const uniqueGenres = new Set();

  if (!Array.isArray(genres) || genres.length === 0) {
    return {
      success: false,
      message: "Please provide at least one valid genre",
    };
  }

  for (const genre of genres) {
    if (typeof genre !== "string" || genre.trim().length === 0)
      return {
        success: false,
        message: "Please provide valid genre",
      };

    if (/^\d+$/.test(genre.trim()))
      return {
        success: false,
        message: "Genre cannot contain only numbers",
      };

    if (!/^[a-zA-Z\s.,!?'"-]+$/.test(genre.trim()))
      return {
        success: false,
        message: "Genres contain invalid characters.",
      };

    uniqueGenres.add(genre.trim().toLowerCase());
  }

  if (uniqueGenres.size > 10) {
    return { success: false, message: "Can only have 10 genres" };
  }

  return { success: true };
};
