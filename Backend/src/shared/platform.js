export const isPlatformValid = (platforms) => {
  if (!Array.isArray(platforms) || platforms.length === 0)
    return {
      success: false,
      message: "Please provide at least one valid platform",
    };

  for (const platform of platforms) {
    if (platform.length > 2) {
      return {
        success: false,
        message: "Exceed platform selected",
      };
    }
    if (typeof platform !== "number")
      return {
        success: false,
        message: "Please provide valid platforms",
      };
    if (![1, 2].includes(platform))
      return {
        success: false,
        message: "Not a social Media platform",
      };
  }

  return { success: true };
};
