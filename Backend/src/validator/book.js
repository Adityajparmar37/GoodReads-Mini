import { findUserById } from "../query/auth.js";
import { findOneBook } from "../query/books.js";
import {
  isValidCoverImage,
  isValidDescription,
  isValidGenre,
  isValidBookPages,
  isValidTitle,
  isValidateId,
} from "../shared/index.js";

export const isAllowPublish = async (ctx) => {
  const userId = ctx.state.user;
  const userExist = await findUserById(userId);

  if (!userExist?.allowPublish) {
    ctx.throw(
      402,
      "You are not allowed to publish. Please request permission."
    );
    return;
  }
};

export const validateTitle = (ctx) => {
  const title = ctx.request.body.title;
  if (!title && ctx.request.method === "POST")
    return {
      field: "title",
      message: "Title must be provided",
    };

  if (title) {
    const { success, message } = isValidTitle(title);

    if (!success)
      return {
        field: "title",
        message,
      };
  }
  ctx.state.book = { ...ctx.state.book, ...(title ? { title } : {}) };
};

export const validateDescription = (ctx) => {
  const description = ctx.request.body.description;

  if (!description && ctx.request.method === "POST")
    return {
      field: "description",
      message: "description must be provided",
    };

  if (description) {
    const { success, message } = isValidDescription(description, 10, 200);
    if (!success)
      return {
        field: "Book description",
        message,
      };
  }
  ctx.state.book = {
    ...ctx.state.book,
    ...(description ? { description } : {}),
  };
};

export const validateGenre = (ctx) => {
  const genres = ctx.request.body?.genres;

  if (!genres && ctx.request.method === "POST")
    return {
      field: "genres",
      message: "Please provide genre.",
    };

  if (genres) {
    const { success, message } = isValidGenre(genres);

    if (!success)
      return {
        field: "genres",
        message,
      };
  }
  ctx.state.book = {
    ...ctx.state.book,
    ...(genres ? { genres } : {}),
  };
};

export const validateAuthor = (ctx) => {
  const author = ctx.request.body.author;

  if (!author && ctx.request.method === "POST")
    return {
      field: "author",
      message: "Please provide author.",
    };

  if (
    author &&
    (!author.trim().length === 0 ||
      typeof author !== "string" ||
      /^\d+$/.test(author.trim()))
  )
    return {
      field: "author",
      message: "Please provide valid author.",
    };

  ctx.state.book = {
    ...ctx.state.book,
    ...(author ? { author } : {}),
  };
};

export const validateBookPages = (ctx) => {
  const bookPages = ctx.request.body.bookPages;

  if (!bookPages && ctx.request.method === "POST")
    return {
      field: "pages",
      message: "Please provide number of pages",
    };

  if (bookPages) {
    const { success, message } = isValidBookPages(bookPages);

    if (!success)
      return {
        field: "Pages",
        message,
      };
  }
  ctx.state.book = {
    ...ctx.state.book,
    ...(bookPages ? { bookPages } : {}),
  };
};

export const validateCoverImage = (ctx) => {
  const coverImage = ctx.request.body.coverImage;

  if (!coverImage && ctx.request.method === "POST")
    return {
      field: "cover image",
      message: "Please provide cover image",
    };

  if (coverImage) {
    const { success, message } = isValidCoverImage(coverImage);
    if (!success)
      return {
        field: "cover image",
        message,
      };
  }

  ctx.state.book = {
    ...ctx.state.book,
    ...(coverImage ? { coverImage } : {}),
  };
};

export const isBookExist = async (ctx) => {
  const { title } = ctx?.state.book;
  const bookExist = (await findOneBook({ title })).at(0);
  if (bookExist) {
    return {
      field: "Book",
      message: "Book already exists",
    };
  }
};

export const validateBookId = (ctx) => {
  const bookId = ctx.params.bookId || ctx.request.body.bookId;

  if (!bookId)
    return {
      field: "Book Id",
      message: "Please provide Book Id",
    };

  if (bookId && !isValidateId(bookId))
    return {
      field: "Book Id",
      message: "Please provide valid book Id",
    };

  ctx.state.book = {
    ...ctx.state.book,
    ...(bookId ? { bookId } : {}),
  };
};

export const isBookValid = async (ctx) => {
  const bookId = ctx?.state?.book?.bookId;

  if (bookId) {
    const result = (await findOneBook({ bookId })).at(0);
    if (!result) {
      return {
        field: "Book",
        message: "Book does not exist",
      };
    }
  }
};
