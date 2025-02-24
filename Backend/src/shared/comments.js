export const isValidComment = (comment) => {
  if (typeof comment !== "string")
    return {
      success: false,
      message: "Provide valid comment",
    };

  const trimmedComment = comment.trim();
  const words = trimmedComment.split(/\s+/);

  if (words.length <= 2 || words.length > 100)
    return {
      success: false,
      message: "Minimum words atlead 2 and Maximum words atmax 100",
    };

  if (trimmedComment.split(/\s+/).every((word) => /^\d+$/.test(word)))
    return {
      success: false,
      message: "Comment cannot be only numbers",
    };

  return {
    success: true,
  };
};
