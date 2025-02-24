export const isValidDescription = (description) => {
  if (typeof description !== "string")
    return {
      success: false,
      message: "Provide valid description",
    };

  const trimmedDescription = description.trim();
  const words = trimmedDescription.split(/\s+/);

  if (words.length <= 10 || words.length > 200)
    return {
      success: false,
      message: "Minimum words atlead 10 and Maximum words atmax 200",
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
