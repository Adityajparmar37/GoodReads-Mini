import { handleAsync } from "../middleware/handleAsync.js";
import {
  insertBook,
  deleteBook,
  updateBookById,
  findBooks,
  findOneBook,
} from "../query/books.js";
import { createId } from "../utils/createId.js";
import { sortMapping } from "../utils/mapping.js";
import { sendResponse } from "../utils/sendResponse.js";

export const createBook = handleAsync(async (ctx) => {
  const bookData = ctx.state.book;
  const publishedBy = ctx.state.user;
  const timestamp = new Date();

  const result = await insertBook({
    ...bookData,
    bookId: createId(),
    averageRating: 0,
    publishedBy,
    createdAt: timestamp,
    updatedAt: timestamp,
  });

  result.acknowledged
    ? sendResponse(ctx, 200, {
        response: {
          success: true,
          message: "Book added successfully",
        },
      })
    : sendResponse(ctx, 400, {
        response: {
          success: false,
          message: "Book not added, please try again",
        },
      });

  return;
});

export const getBooks = handleAsync(async (ctx) => {
  const { sort, page, limit, searchTerm } = ctx.state.shared || {};
  const sortOrder = sort ? sortMapping.get(sort) : 1;

  const result = await findBooks(searchTerm, sortOrder, page, limit);
  result.length > 0
    ? sendResponse(ctx, 200, {
        response: {
          success: true,
          data: result,
        },
      })
    : sendResponse(ctx, 400, {
        response: {
          success: true,
          message: "No books found",
        },
      });
});

export const getBook = handleAsync(async (ctx) => {
  const bookId = ctx.state.book;
  const result = await findOneBook(bookId);

  result
    ? sendResponse(ctx, 200, {
        response: {
          success: true,
          data: result,
        },
      })
    : sendResponse(ctx, 400, {
        response: {
          success: false,
          message: "Book Not Found",
        },
      });
});

export const updateBook = handleAsync(async (ctx) => {
  const { bookId, ...updateBookData } = ctx.state.book;
  const timestamp = new Date();
  const updateQuery = Object.keys(updateBookData).reduce(
    (acc, key) => ({
      ...acc,
      ...(key === "genres"
        ? { $addToSet: { genres: { $each: updateBookData[key] } } }
        : { $set: { ...acc.$set, [key]: updateBookData[key] } }),
    }),
    { $set: { updatedAt: timestamp } }
  );

  const result = await updateBookById(bookId, updateQuery);

  sendResponse(ctx, result.modifiedCount > 0 ? 200 : 400, {
    response: {
      success: result.modifiedCount > 0,
      message:
        result.modifiedCount > 0
          ? "Book updated successfully"
          : "Book not updated, please try again",
    },
  });
});

export const removeBook = handleAsync(async (ctx) => {
  const bookId = ctx.state.book;
  const result = await deleteBook(bookId);
  result.acknowledged
    ? sendResponse(ctx, 200, {
        response: {
          success: true,
          message: "Book deleted successfully",
        },
      })
    : sendResponse(ctx, 400, {
        response: {
          success: false,
          message: "Book not delete, please try again",
        },
      });

  return;
});
