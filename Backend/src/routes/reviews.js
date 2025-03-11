import Router from "koa-router";
import { auth } from "../middleware/auth.js";
import { validator } from "../middleware/validator.js";
import { isBookValid, validateBookId } from "../validator/book.js";
import {
  validReview,
  validateStars,
  validateReviewId,
  isReviewExist,
  isPlubisherReview,
} from "../validator/review.js";
import {
  removeReview,
  addReview,
  updateReview,
  getReviews,
} from "../controller/index.js";
import { isBodyEmpty } from "../validator/common.js";

const route = new Router({ prefix: "/reviews" });

route.post(
  "/:bookId",
  auth,
  validator([
    isBodyEmpty,
    validateBookId,
    isBookValid,
    isPlubisherReview,
    validReview,
    validateStars,
  ]),
  addReview
);

route.get(
  "/book/:bookId",
  auth,
  validator([validateBookId, isBookValid]),
  getReviews
);
route.get("/user", auth, getReviews);

route.patch(
  "/:reviewId",
  auth,
  validator([
    isBodyEmpty,
    validateReviewId,
    isReviewExist,
    validReview,
    validateStars,
  ]),
  updateReview
);

route.delete(
  "/:reviewId",
  auth,
  validator([validateReviewId, isReviewExist]),
  removeReview
);

export default route;
