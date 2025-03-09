export const isValidDescription = (description,min,max) => {
  if (typeof description !== "string")
    return {
      success: false,
      message: "Provide valid description",
    };

  const trimmedDescription = description.trim();
  const words = trimmedDescription.split(/\s+/);

  if (words.length <= min || words.length > max)
    return {
      success: false,
      message: "Minimum words at least 5 and Maximum words at max 200",
    };

  if (trimmedDescription.split(/\s+/).every((word) => /^\d+$/.test(word)))
    return {
      success: false,
      message: "Description cannot be only numbers",
    };

  return {
    success: true,
  };
};
