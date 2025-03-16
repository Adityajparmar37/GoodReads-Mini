import { findOneShelf } from "../query/shelf.js";
import { isValidateId } from "./validId.js";

export const isShelvesExists = async (shelvesIds, loginUserId) => {
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
    const shelfExist = await findOneShelf({ shelfId });
    if (!shelfExist)
      return {
        success: false,
        message: "shelf does not exist",
      };

    if (shelfExist.userId !== loginUserId) {
      return {
        success: false,
        message: "Shelf is not yours",
      };
    }
  }

  return { success: true };
};
