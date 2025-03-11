import { findOneBook } from "../query/books.js";
import { findOneReview } from "../query/review.js";
import { isValidateId, isValidComment } from "../shared/index.js";

export const validateStars = (ctx) => {
  const stars = ctx.request.body.stars;
  if (stars && typeof stars !== "number")
    return {
      field: "book stars",
      message: "Please provide valid book stars",
    };

  ctx.state.reviews = {
    ...ctx.state.reviews,
    ...(stars ? { stars } : {}),
  };
};

export const validReview = (ctx) => {
  const review = ctx.request.body.review;

  if (review) {
    const { success, message } = isValidComment(review);

    if (!success)
      return {
        field: "book review",
        message,
      };
  }
  ctx.state.reviews = {
    ...ctx.state.reviews,
    ...(review ? { review } : {}),
  };
};

export const validateReviewId = (ctx) => {
  const reviewId = ctx.params.reviewId || ctx.request.body?.reviewId;

  if (!reviewId)
    return {
      field: "review Id",
      message: "Please provide review Id",
    };

  if (reviewId && !isValidateId(reviewId))
    return {
      field: "review Id",
      message: "Please provide valid review Id",
    };

  ctx.state.reviews = {
    ...ctx.state.reviews,
    ...(reviewId ? { reviewId } : {}),
  };
};

export const isReviewExist = async (ctx) => {
  const reviewId = ctx?.state?.reviews?.reviewId;
  let result;

  if (reviewId) {
    result = await findOneReview({ reviewId });

    if (!result) {
      return {
        field: "Review",
        message: "Review does not exist",
      };
    }
  }
  if (reviewId) {
    ctx.state.book = {
      ...ctx.state.book,
      ...(result.bookId ? { bookId: result.bookId } : {}),
    };
  }
};

export const isPlubisherReview = async (ctx) => {
  const userId = ctx.state.user;
  const bookId = ctx?.state?.book?.bookId;
  const bookDetails = await findOneBook({ bookId });

  if (userId === bookDetails.publishedBy)
    return {
      field: "Review",
      message: "Plubisher cannot add review",
    };

  const reviewDetails = await findOneReview({ userId, bookId });

  if (reviewDetails)
    return {
      field: "Review",
      message: "Review already exist, ",
    };
};
