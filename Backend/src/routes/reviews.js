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
  generateReview,
} from "../controller/index.js";
import {
  isBodyEmpty,
  validatepage,
  validatePrompt,
  validateSortOrder,
} from "../validator/common.js";
import { featureActivationStatus } from "../middleware/featureActivationStatus.js";

const route = new Router({ prefix: "/reviews" });

route.post(
  "/generate",
  auth,
  featureActivationStatus("AIreview"),
  validator([isBodyEmpty, validateBookId, isBookValid, validatePrompt]),
  generateReview
);

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
  validator([validateBookId, isBookValid, validateSortOrder, validatepage]),
  getReviews
);
route.get(
  "/user",
  auth,
  validator([validateSortOrder, validatepage]),
  getReviews
);

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
