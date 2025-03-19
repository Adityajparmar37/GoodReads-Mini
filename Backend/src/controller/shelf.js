import {
  deleteShelf,
  insertShelf,
  updateShelfById,
  insertBookToShelves,
  deleteBookFromShelf,
  findShevles,
  shelfBooks,
  findOneShelf,
} from "../query/shelf.js";
import { handleAsync } from "../middleware/handleAsync.js";
import { createId } from "../utils/createId.js";
import { sendResponse } from "../utils/sendResponse.js";
import { timestamp } from "../utils/timestamp.js";
import { bookStatusMapping } from "../utils/mapping.js";

// @route   POST/api/v1/shelf/
// @desc    create shelf
export const createShelf = handleAsync(async (ctx) => {
  const shelfData = ctx.state.shelf;
  const userId = ctx.state.user;

  const result = await insertShelf({
    ...shelfData,
    shelfId: createId(),
    userId,
    isPrivate: shelfData.isPrivate ?? false,
    createdAt: timestamp(),
    updatedAt: timestamp(),
  });

  result
    ? sendResponse(ctx, 200, {
        response: {
          success: true,
          message: "Shelf created",
        },
      })
    : sendResponse(ctx, 400, {
        response: {
          success: false,
          message: "shelf not created, please try again",
        },
      });
});

// @route   GET /api/v1/shelf/
// @desc    Get shelves (public or user's own)
export const getShelves = handleAsync(async (ctx) => {
  const userId = ctx.state.user;
  const fetchUserOnly = ctx.path.endsWith("/my");
  const { searchTerm, sortOrder, page, limit } = ctx.state.shared;

  const isPrivateShelves = fetchUserOnly ? { userId } : { isPrivate: false };
  const query = {
    ...isPrivateShelves,
    ...(searchTerm && {
      $or: [
        { shelfName: { $regex: searchTerm, $options: "i" } },
        { description: { $regex: searchTerm, $options: "i" } },
      ],
    }),
  };

  const shelvesResult = await findShevles(query, sortOrder, page, limit);

  if (shelvesResult.length === 0) {
    sendResponse(ctx, 400, {
      response: {
        success: false,
        message: `No ${fetchUserOnly ? "user" : "public"} shelves found`,
      },
    });
    return;
  }

  const booksInShelves = await Promise.all(
    shelvesResult.map(async (shelf) => {
      const books = await shelfBooks(shelf.shelfId);
      const mappedBooks = books.map((book) => ({
        ...book,
        status: bookStatusMapping[book.status] || "Unknown",
      }));

      return {
        ...shelf,
        books: mappedBooks.length > 0 ? mappedBooks : [],
      };
    })
  );

  booksInShelves.length > 0
    ? sendResponse(ctx, 200, {
        response: {
          success: true,
          data: booksInShelves,
        },
      })
    : sendResponse(ctx, 400, {
        response: {
          success: false,
          message: `No shelves found`,
        },
      });
});

// @route   GET /api/v1/shelf/:shelfId
// @desc    Get shelf
export const getShelf = handleAsync(async (ctx) => {
  const shelfId = ctx.state?.shared;
  const result = await findOneShelf(shelfId);

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
          message: `No shelf found`,
        },
      });
});

// @route   PATCH/api/v1/shelf/
// @desc    update shelf details
export const updateShelf = handleAsync(async (ctx) => {
  const shelfId = ctx.state?.shared;
  const updateShelfData = ctx.state?.shelf;

  const result = await updateShelfById(shelfId, {
    ...updateShelfData,
    updatedAt: timestamp(),
  });

  if (!result.acknowledged) {
    sendResponse(ctx, 400, {
      response: {
        succuess: false,
        message: "Shelf not updated please try again",
      },
    });
    return;
  }

  result.modifiedCount > 0
    ? sendResponse(ctx, 200, {
        response: {
          succuess: true,
          message: "Shelf updated successfully",
        },
      })
    : sendResponse(ctx, 200, {
        response: {
          succuess: false,
          message: "Shelf remains same",
        },
      });
});

// @route   DELET/api/v1/shelf/
// @desc    delete shelf
export const removeShelf = handleAsync(async (ctx) => {
  const shelfId = ctx.state.shelf;
  const result = await deleteShelf(shelfId);

  if (!result.acknowledged) {
    sendResponse(ctx, 400, {
      response: {
        field: "shelf",
        message: "shelf not deleted, please try again",
      },
    });
    return;
  }

  const removeShelfBooks = await deleteBookFromShelf(shelfId);

  result.deletedCount > 0 && removeShelfBooks.acknowledged
    ? sendResponse(ctx, 200, {
        response: {
          success: true,
          message: "shelf deleted successfully",
        },
      })
    : sendResponse(ctx, 200, {
        response: {
          success: false,
          message: "shelf already remove",
        },
      });
});

// @route   POST/api/v1/shelf/
// @desc    add book to multiple shelves
export const addBookToShelves = handleAsync(async (ctx) => {
  const shelves = ctx.state?.shelf?.shelvesIds;
  const status = ctx.state.book?.status;
  const { bookId } = ctx.state?.book;
  const shelvesBook = shelves?.map((shelfId) => ({
    shelfId,
    bookId,
    status,
    createdAt: timestamp(),
    updatedAt: timestamp(),
  }));
  const result = await insertBookToShelves(shelvesBook);

  result.insertedCount === shelves.length
    ? sendResponse(ctx, 200, {
        response: {
          success: true,
          message: "Book added to shelf",
        },
      })
    : sendResponse(ctx, 400, {
        response: {
          success: false,
          message: "Book not added to shelf, please try again",
        },
      });
});

// @route   DELETE/api/v1/shelf/
// @desc    remove book from shelves
export const removeBookfromShelf = handleAsync(async (ctx) => {
  const { bookId } = ctx.request.body;
  const result = await deleteBookFromShelf({ bookId: { $in: bookId } });

  if (!result.acknowledged) {
    sendResponse(ctx, 400, {
      response: {
        success: false,
        message: "Book not deleted, please try again",
      },
    });
    return;
  }

  result.deletedCount > 0
    ? sendResponse(ctx, 200, {
        response: {
          success: false,
          message: "Book remove from the shelf",
        },
      })
    : sendResponse(ctx, 200, {
        response: {
          success: false,
          message: "Book already remove, please try again",
        },
      });
});

// @route   POST/api/v1/shelf/
// @desc    move multiple books to one shelf
export const moveBookfromShelf = handleAsync(async (ctx) => {
  const books = ctx.state.shelf?.bookIds;
  const shelfId = ctx.state.shared?.shelfId;
  const status = ctx.state.book?.status;
  const booksToAdd = books?.map((bookId) => ({
    shelfId,
    bookId,
    status,
    createdAt: timestamp(),
    updatedAt: timestamp(),
  }));

  const result = await insertBookToShelves(booksToAdd);
  result.insertedCount === books.length
    ? sendResponse(ctx, 200, {
        response: {
          success: true,
          message: "Book added to shelf",
        },
      })
    : sendResponse(ctx, 400, {
        response: {
          success: false,
          message: "Book not added to shelf, please try again",
        },
      });
});
