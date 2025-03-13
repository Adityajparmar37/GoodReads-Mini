import Router from "koa-router";
import {
  addNestedComment,
  getNestedComments,
  removeNestedComment,
  getNestedCommentsLikes,
  likeNestedComments,
  updateNestedComment,
} from "../controller/index.js";
import { auth } from "../middleware/auth.js";
import { validator } from "../middleware/validator.js";
import { isBodyEmpty, validatepage } from "../validator/common.js";
import {
  isCommentExist,
  isCommentIdValid,
} from "../validator/reviewCommentsLikes.js";
import {
  isNestedCommentIdValid,
  isNestedCommentExist,
  validNestedComment,
  validateNestedCommentLike,
} from "../validator/nestedCommentsLikes.js";

const route = new Router({ prefix: "/nestedComments" });

route.post(
  "/",
  auth,
  validator([
    isBodyEmpty,
    isCommentIdValid,
    isCommentExist,
    validNestedComment,
  ]),
  addNestedComment
);

route.get(
  "/:commentId",
  auth,
  validator([isCommentIdValid, isCommentExist, validatepage]),
  getNestedComments
);

route.delete(
  "/:nestedCommentId",
  auth,
  validator([isNestedCommentIdValid, isNestedCommentExist]),
  removeNestedComment
);

route.put(
  "/:nestedCommentId",
  auth,
  validator([
    isBodyEmpty,
    isNestedCommentIdValid,
    isNestedCommentExist,
    validNestedComment,
  ]),
  updateNestedComment
);

route.get(
  "/getLikes/:commentId",
  auth,
  validator([isCommentIdValid, isCommentExist]),
  getNestedCommentsLikes
);

route.get(
  "/like/:commentId",
  auth,
  validator([isCommentIdValid, isCommentExist, validateNestedCommentLike]),
  likeNestedComments
);

export default route;
