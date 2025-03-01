export const isValidShelfName = (shelfName) => {
  if (typeof shelfName !== "string" || shelfName.trim().length === 0)
    return {
      success: false,
      message: "Please provide valid Shelf name",
    };

  if (shelfName.trim().length < 5 || shelfName.trim().length > 10)
    return {
      success: true,
      message: "Shelf Name can be minimum of 5 and maximum of 10 character ",
    };

  if (/^\d+$/.test(shelfName.trim()))
    return {
      success: false,
      message: "Shelf name cannot contain only numbers.",
    };

  return { success: true };
};
