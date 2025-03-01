import { isValidateId } from "./validId.js";

export const isShelvesExists = async (shelvesIds) => {
  if (!Array.isArray(shelvesIds) || shelvesIds.length === 0)
    return {
      success: false,
      message: "Please provide at least shelf",
    };

  for (const shelfId of shelvesIds) {
    if (!isValidateId(shelfId)) {
      return {
        success: false,
        message: "Please provide valid shelf Id",
      };
    }
    if (!(await findOneShelf({ shelfId })))
      return {
        success: false,
        message: "shelf does not exist",
      };
  }

  return { success: true };
};
