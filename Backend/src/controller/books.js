import { handleAsync } from "../middleware/handleAsync.js";
import {
  insertBook,
  deleteBook,
  updateBookById,
  findBooks,
  findOneBook,
} from "../query/books.js";
import { deleteReviews } from "../query/review.js";
import { createId } from "../utils/createId.js";
import { sendResponse } from "../utils/sendResponse.js";
import { timestamp } from "../utils/timestamp.js";
import Bluebird from "bluebird";

// @route   POST /api/v1/books/
// @desc    add book
export const createBook = handleAsync(async (ctx) => {
  const bookData = ctx.state.book;
  const publishedBy = ctx.state.user;

  const result = await insertBook({
    ...bookData,
    bookId: createId(),
    averageRating: 0,
    publishedBy,
    createdAt: timestamp(),
    updatedAt: timestamp(),
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

// @route   GET/api/v1/books/
// @desc    get books
export const getBooks = handleAsync(async (ctx) => {
  const { sortOrder, page, limit, searchTerm } = ctx.state.shared || {};
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
          success: false,
          message: "No books found",
        },
      });
});

// @route   GET/api/v1/books/:bookId
// @desc    get book
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

// @route   PATCH/api/v1/books/
// @desc    update book
export const updateBook = handleAsync(async (ctx) => {
  const { bookId, ...updateBookData } = ctx.state.book;
  const updateQuery = Object.keys(updateBookData).reduce(
    (acc, key) => ({
      ...acc,
      ...(key === "genres"
        ? { $addToSet: { genres: { $each: updateBookData[key] } } }
        : { $set: { ...acc.$set, [key]: updateBookData[key] } }),
    }),
    { $set: { updatedAt: timestamp() } }
  );

  const result = await updateBookById(bookId, updateQuery);

  if (!result.acknowledged) {
    sendResponse(ctx, 400, {
      response: {
        succuess: false,
        message: "Book not updated please try again",
      },
    });
    return;
  }

  result.modifiedCount > 0
    ? sendResponse(ctx, 200, {
        response: {
          success: true,
          message: "Book updated successfully",
        },
      })
    : sendResponse(ctx, 400, {
        response: {
          success: false,
          message: "Book not update, please try again",
        },
      });
});

// @route   DELET/api/v1/books/bookId
// @desc    delete book
export const removeBook = handleAsync(async (ctx) => {
  const bookId = ctx.state.book;

  const deleteOperations = [
    () => deleteBook(bookId),
    () => deleteReviews(bookId),
    () => deleteBookFromShelf(bookId),
  ];
  const results = await Bluebird.mapSeries(deleteOperations, (queries) =>
    queries()
  );
  const [bookDeleteResult, reviewDeleteResult, removeBookFromShelfResult] =
    results;

  if (
    bookDeleteResult.acknowledged ||
    reviewDeleteResult.acknowledged ||
    removeBookFromShelfResult.acknowledged
  ) {
    sendResponse(ctx, 400, {
      response: {
        success: false,
        message: "Book not delete, please try again",
      },
    });
    return;
  }

  bookDeleteResult.deletedCount > 0
    ? sendResponse(ctx, 200, {
        response: {
          success: true,
          message: "Book deleted successfully",
        },
      })
    : sendResponse(ctx, 200, {
        response: {
          success: false,
          message: "Book already removed",
        },
      });

  return;
});
