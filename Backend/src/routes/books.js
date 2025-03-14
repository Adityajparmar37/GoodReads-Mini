import Router from "koa-router";
import { auth } from "../middleware/auth.js";
import { validator } from "../middleware/validator.js";
import {
  isBookValid,
  isAllowPublish,
  isBookExist,
  validateAuthor,
  validateBookId,
  validateBookPages,
  validateCoverImage,
  validateDescription,
  validateGenre,
  validateTitle,
} from "../validator/book.js";
import {
  createBook,
  removeBook,
  updateBook,
  getBooks,
  getBook,
  vectorSearchBookGenres,
} from "../controller/index.js";
import {
  isBodyEmpty,
  validatepage,
  validateSearchTerm,
  validateSortOrder,
} from "../validator/common.js";
import { featureActivationStatus } from "../middleware/featureActivationStatus.js";

const route = new Router({ prefix: "/books" });

route.post(
  "/",
  auth,
  featureActivationStatus("publishBook"),
  validator([
    isAllowPublish,
    isBodyEmpty,
    validateTitle,
    validateDescription,
    validateGenre,
    validateAuthor,
    validateBookPages,
    validateCoverImage,
    isBookExist,
  ]),
  createBook
);

route.get(
  "/",
  auth,
  validator([validatepage, validateSortOrder, validateSearchTerm]),
  getBooks
);

route.get(
  "/vectorSearch",
  auth,
  validator([validateSearchTerm]),
  vectorSearchBookGenres
);

route.get("/:bookId", auth, validator([validateBookId, isBookValid]), getBook);

route.patch(
  "/:bookId",
  auth,
  validator([
    isBodyEmpty,
    isAllowPublish,
    validateBookId,
    validateTitle,
    validateDescription,
    validateGenre,
    validateAuthor,
    validateBookPages,
    validateCoverImage,
    isBookValid,
  ]),
  updateBook
);

route.delete(
  "/:bookId",
  auth,
  validator([validateBookId, isBookValid]),
  removeBook
);

export default route;
