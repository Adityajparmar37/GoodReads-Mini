import Router from "koa-router";
import {
  addReviewComment,
  removeReviewComment,
  updateReviewComment,
  getReviewComments,
  likeReview,
  getReviewLikes,
} from "../controller/index.js";
import { auth } from "../middleware/auth.js";
import { validator } from "../middleware/validator.js";
import { isBodyEmpty, validatepage } from "../validator/common.js";
import { isReviewExist, validateReviewId } from "../validator/review.js";
import {
  isCommentExist,
  isCommentIdValid,
  validReviewComment,
  validateLike,
} from "../validator/reviewCommentsLikes.js";

const route = new Router({ prefix: "/comments" });

route.post(
  "/",
  auth,
  validator([isBodyEmpty, validateReviewId, isReviewExist, validReviewComment]),
  addReviewComment
);

route.get(
  "/:reviewId",
  auth,
  validator([validateReviewId, isReviewExist, validatepage]),
  getReviewComments
);

route.delete(
  "/:commentId",
  auth,
  validator([isCommentIdValid, isCommentExist]),
  removeReviewComment
);

route.put(
  "/:commentId",
  auth,
  validator([
    isBodyEmpty,
    isCommentIdValid,
    isCommentExist,
    validReviewComment,
  ]),
  updateReviewComment
);

route.get(
  "/getLikes/:reviewId",
  auth,
  validator([validateReviewId, isReviewExist]),
  getReviewLikes
);

route.get(
  "/like/:reviewId",
  auth,
  validator([validateReviewId, isReviewExist, validateLike]),
  likeReview
);

export default route;
