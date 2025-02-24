export const isValidTitle = (title) => {
  if (!title || typeof title !== "string") {
    return { success: false, message: "Title must be a valid string." };
  }

  const trimmedTitle = title.trim();
  if (trimmedTitle.length < 5 || trimmedTitle.length > 100) {
    return {
      success: false,
      message: "Title must be between 5 and 100 characters.",
    };
  }
  if (/^\d+$/.test(trimmedTitle)) {
    return { success: false, message: "Title cannot contain only numbers." };
  }

  return { success: true };
};
