export const isValidName = (fieldName, value , min , max) => {
  if (typeof value !== "string" || value.trim().length === 0)
    return {
      success: false,
      message: `Please provide valid ${fieldName}`,
    };

  if (value.trim().length < min || value.trim().length > max)
    return {
      success: true,
      message: `${fieldName} can be minimum of 5 and maximum of 10 character `,
    };

  if (/^\d+$/.test(value.trim()))
    return {
      success: false,
      message: `${fieldName} cannot contain only numbers.`,
    };

  return { success: true };
};
