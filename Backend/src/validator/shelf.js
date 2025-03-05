import {
  isValidShelfName,
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
    const { success, message } = isValidShelfName(shelfName);
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
    const { success, message } = isValidDescription(description);

    if (!success)
      return {
        field: "description",
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

  if (shelfId) {
    const result = await findOneShelf(shelfId);

    if (!result)
      return {
        field: "shelf",
        message: "Shelf does not exist",
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
  const bookIds = ctx.request.body?.bookId;

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

  if (!shelvesIds)
    return {
      field: "shelves",
      message: "Please provide shelves Id",
    };

  const { success, message } = await isShelvesExists(shelvesIds);

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

export const validateBookInShelf = async (ctx) => {
  const bookId = ctx?.state?.book?.bookId;
  const shelvesIds = ctx.state?.shelf?.shelvesIds;

  if (shelvesIds && bookId) {
    for (const shelfId of shelvesIds) {
      const result = await bookInShelf({ shelfId, bookId });
      if (result.length > 0)
        return {
          field: "Shelf's Book",
          message: "Book already exist in shelf ",
        };
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
