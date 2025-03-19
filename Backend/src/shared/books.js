import { findOneBook } from "../query/books.js";
import { isValidateId } from "./validId.js";

export const isbooksExists = async (bookIds) => {
  if (!Array.isArray(bookIds) || bookIds.length === 0)
    return {
      success: false,
      message: "Please provide at least one book to add",
    };

  for (const bookId of bookIds) {
    if (!isValidateId(bookId))
      return {
        success: false,
        message: "Please provide valid book Id",
      };

    const booksExist = (await findOneBook({ bookId })).at(0);
    if (!booksExist)
      return {
        success: false,
        message: "Book does not exist",
      };
  }

  return { success: true };
};
