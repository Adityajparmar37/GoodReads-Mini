import Router from "koa-router";
import { postBook, deleteBookPost, getPosts } from "../controller/index.js";
import { auth } from "../middleware/auth.js";
import { validator } from "../middleware/validator.js";
import { isBookValid, validateBookId } from "../validator/book.js";
import { isBodyEmpty, validateSortOrder } from "../validator/common.js";
import {
  isPostExist,
  validatePlatform,
  validateSharedId,
  validateSocialMediaPlatform,
} from "../validator/post.js";

const route = new Router({ prefix: "/post" });

route.post(
  "/:bookId",
  auth,
  validator([
    isBodyEmpty,
    validateBookId,
    isBookValid,
    validateSocialMediaPlatform,
  ]),
  postBook
);

route.get(
  "/",
  auth,
  validator([validatePlatform, validateSortOrder]),
  getPosts
);

route.delete(
  "/:sharedId",
  auth,
  validator([validateSharedId, isPostExist]),
  deleteBookPost
);
export default route;
