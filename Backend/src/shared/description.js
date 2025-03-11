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
      message: `Minimum words at least ${min} and Maximum words at max ${max}`,
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
