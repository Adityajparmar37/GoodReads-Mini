import { findOneReview } from "../query/review.js";
import { isValidateId, isValidComment } from "../shared/index.js";

export const validateLiked = (ctx) => {
  const isLiked = ctx.request.body.isLiked;
  if (isLiked !== undefined && typeof isLiked !== "boolean")
    return {
      field: "book like",
      message: "Please provide valid book like",
    };

  ctx.state.reviews = {
    ...ctx.state.reviews,
    ...(isLiked !== undefined ? { isLiked } : {}),
  };
};

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

export const validComments = (ctx) => {
  const comment = ctx.request.body.comment;

  if (comment) {
    const { success, message } = isValidComment(comment);

    if (!success)
      return {
        field: "book comments",
        message,
      };
  }
  ctx.state.reviews = {
    ...ctx.state.reviews,
    ...(comment ? { comment } : {}),
  };
};

export const validateReviewId = (ctx) => {
  const reviewId = ctx.params.reviewId;

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

  if (reviewId) {
    const result = await findOneReview({ reviewId });

    if (!result) {
      return {
        field: "Review",
        message: "Review does not exist",
      };
    }
  }
};
