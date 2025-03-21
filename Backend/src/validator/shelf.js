import {
  isValidName,
  isValidDescription,
  isValidateId,
  isbooksExists,
  isShelvesExists,
} from "../shared/index.js";
import { bookInShelf, findOneShelf } from "../query/shelf.js";

export const validateShelfName = (ctx) => {
  const shelfName = ctx.request.body.shelfName;
  if (!shelfName && ctx.request.method === "POST")
    return {
      field: "shelf name",
      message: "Please provide shelf name",
    };

  if (shelfName) {
    const { success, message } = isValidName("shelf Name", shelfName, 5, 10);
    if (!success)
      return {
        field: "shelf name",
        message,
      };
  }

  ctx.state.shelf = {
    ...ctx.state.shelf,
    ...(shelfName ? { shelfName } : {}),
  };
};

export const validateDescription = (ctx) => {
  const description = ctx.request.body.description;
  if (!description && ctx.request.method === "POST")
    return {
      field: "description",
      message: "Please provide description for shelf",
    };

  if (description) {
    const { success, message } = isValidDescription(description, 2, 10);

    if (!success)
      return {
        field: "Shelf description",
        message,
      };
  }
  ctx.state.shelf = {
    ...ctx.state.shelf,
    ...(description ? { description } : {}),
  };
};

export const isPrivateValid = (ctx) => {
  const isPrivate = ctx.request.body.isPrivate;
  if (isPrivate && typeof isPrivate !== "boolean")
    return {
      field: "private",
      message: "Please provide valid private",
    };

  ctx.state.shelf = {
    ...ctx.state.shelf,
    ...(isPrivate ? { isPrivate } : {}),
  };
};

export const validateShelfId = (ctx) => {
  const shelfId = ctx.params.shelfId || ctx.request.body.shelfId;

  if (!shelfId)
    return {
      field: "shelf Id",
      message: "Please provide shelf Id",
    };

  if (shelfId && !isValidateId(shelfId))
    return {
      field: "shelf Id",
      message: "Please provide valid shelf Id",
    };

  ctx.state.shared = {
    ...ctx.state.shared,
    ...(shelfId ? { shelfId } : {}),
  };
};

export const isShelfExist = async (ctx) => {
  const shelfId = ctx.state?.shared;
  const userId = ctx.state.user;

  if (shelfId) {
    const result = await findOneShelf(shelfId);

    if (!result)
      return {
        field: "shelf",
        message: "Shelf does not exist",
      };

    if (result.userId !== userId)
      return {
        field: "shelf",
        message: "Not your self",
      };
  }
};

export const isShelfValid = async (ctx) => {
  const shelfName = ctx.state.shelf;
  const result = await findOneShelf(shelfName);

  if (result)
    return {
      field: "shelf",
      message: "Shelf already exist",
    };
};

export const validateBooksExist = async (ctx) => {
  const bookIds = ctx.request.body?.books;

  if (!bookIds)
    return {
      field: "books",
      message: "Please provide books Ids to be added to shelf",
    };

  if (bookIds) {
    const { success, message } = await isbooksExists(bookIds);
    if (!success)
      return {
        field: "books",
        message,
      };
  }

  ctx.state.shelf = {
    ...ctx.state.shelf,
    ...(bookIds ? { bookIds } : {}),
  };
};

export const validateShelevs = async (ctx) => {
  const shelvesIds = ctx.request.body?.shelves;
  const loginUserId = ctx.state.user;

  if (!shelvesIds)
    return {
      field: "shelves",
      message: "Please provide shelves Id",
    };

  const { success, message } = await isShelvesExists(shelvesIds, loginUserId);

  if (!success)
    return {
      field: "shelves",
      message,
    };

  ctx.state.shelf = {
    ...ctx.state.shelf,
    ...(shelvesIds ? { shelvesIds } : {}),
  };
};

// will check whether book already is present in the shelf or not
export const validateBookInShelf = async (ctx) => {
  const bookId = ctx?.state?.book?.bookId || ctx?.state?.shelf?.bookIds;
  const shelvesIds = ctx.state?.shelf?.shelvesIds || ctx.state.shared?.shelfId;

  if (shelvesIds && bookId) {
    if (Array.isArray(shelvesIds)) {
      for (const shelfId of shelvesIds) {
        const result = await bookInShelf({ shelfId, bookId });
        if (result)
          return {
            field: "Shelf's Book",
            message: "Book already exist in shelf ",
          };
      }
    } else if (Array.isArray(bookId)) {
      for (const book of bookId) {
        const result = await bookInShelf({ shelfId: shelvesIds, bookId: book });
        if (result)
          return {
            field: "Shelf's Book",
            message: "Book already exist in shelf ",
          };
      }
    }
  }
};

export const checkBookAbsenceInShelf = async (ctx) => {
  const bookIds = ctx.state.shelf?.bookIds;

  if (bookIds) {
    for (const bookId of bookIds) {
      const result = await bookInShelf({ bookId });
      if (!result)
        return {
          field: "Shelf 's Book",
          message: "Book to be remove does not exit in shelf",
        };
    }
  }
};

export const validateBookStatus = (ctx) => {
  const status = ctx.request.body?.status;

  if (status) {
    if (!["CR", "WR", "R"].includes(status)) {
      return {
        field: "Book status",
        message: "Please provide valid status",
      };
    }
  }

  ctx.state.book = {
    ...ctx.state.book,
    ...(status ? { status } : { status: "WR" }),
  };
};
