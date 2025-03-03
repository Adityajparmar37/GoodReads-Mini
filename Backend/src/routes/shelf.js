import Router from "koa-router";
import { auth } from "../middleware/auth.js";
import { validator } from "../middleware/validator.js";
import {
  isBodyEmpty,
  validatepage,
  validateSearchTerm,
  validateSortOrder,
} from "../validator/common.js";
import {
  isPrivateValid,
  validateDescription,
  validateShelfName,
  isShelfExist,
  validateShelfId,
  validateShelevs,
  validateBooksExist,
  validateBookInShelf,
  isShelfValid,
  checkBookAbsenceInShelf,
} from "../validator/shelf.js";
import {
  createShelf,
  removeShelf,
  updateShelf,
  addBookToShelves,
  removeBookfromShelf,
  moveBookfromShelf,
  getShelves,
  getShelf,
} from "../controller/index.js";
import { isBookValid, validateBookId } from "../validator/book.js";

const route = new Router({ prefix: "/shelf" });

route.get(
  "/",
  auth,
  validator([validateSortOrder, validateSearchTerm, validatepage]),
  getShelves
);

route.get("/my", auth, getShelves);

route.get(
  "/:shelfId",
  auth,
  validator([validateShelfId, isShelfExist]),
  getShelf
);

route.post(
  "/",
  auth,
  validator([
    isBodyEmpty,
    validateShelfName,
    validateDescription,
    isPrivateValid,
    isShelfValid,
  ]),
  createShelf
);

route.patch(
  "/:shelfId",
  auth,
  validator([
    validateShelfId,
    isShelfExist,
    isBodyEmpty,
    validateShelfName,
    validateDescription,
    isPrivateValid,
  ]),
  updateShelf
);

route.delete(
  "/removeBook",
  auth,
  validator([isBodyEmpty, validateBooksExist, checkBookAbsenceInShelf]),
  removeBookfromShelf
);

route.delete(
  "/:shelfId",
  validator([validateShelfId, isShelfExist]),
  removeShelf
);

route.post(
  "/addBook",
  auth,
  validator([
    isBodyEmpty,
    validateBookId,
    isBookValid,
    validateShelevs,
    validateBookInShelf,
  ]),
  addBookToShelves
);

route.post(
  "/moveBook",
  auth,
  validator([
    isBodyEmpty,
    validateShelfId,
    isShelfExist,
    validateBooksExist,
    validateBookInShelf,
  ]),
  moveBookfromShelf
);

export default route;
