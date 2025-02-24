export const isValidBookPages = (bookPages) => {
  if (typeof bookPages === "string")
    return {
      field: "Book pages",
      message: "Please provide valid pages",
    };

  if (!/^\d+$/.test(bookPages)) {
    return {
      field: "Book pages",
      message: "Book page can only conatin numbers",
    };
  }
  if (bookPages < 4 || bookPages > 5000) {
    return {
      field: "Book pages",
      message: "Minimum pages can be 4 and Maximum pages can be 5000",
    };
  }
  return { success: true };
};
