import { handleAsync } from "../middleware/handleAsync.js";
import {
  deleteReview,
  findReviews,
  insertReview,
  updateBookAvgRating,
  updateReviewById,
} from "../query/review.js";
import { createId } from "../utils/createId.js";
import { sendResponse } from "../utils/sendResponse.js";

// @route   POST/api/v1/reviews/
// @desc    add review
export const addReview = handleAsync(async (ctx) => {
  const reviewData = ctx.state.reviews;
  const { bookId } = ctx.state.book;
  const userId = ctx.state.user;
  const timestamp = new Date();
  const result = await insertReview({
    ...reviewData,
    reviewId: createId(),
    bookId,
    userId,
    isLiked: reviewData.isLiked ?? false,
    stars: reviewData.stars ?? 0,
    createdAt: timestamp,
    updateAt: timestamp,
  });

  const ratingResult = await updateBookAvgRating(bookId);

  result.acknowledged && ratingResult.acknowledged
    ? sendResponse(ctx, 200, {
        response: {
          success: true,
          message: "Thank you for your review",
        },
      })
    : sendResponse(ctx, 400, {
        response: {
          success: false,
          message: "Review not added, please try again",
        },
      });
});


// @route   GET/api/v1/reviews/bookID
// @route   GET/api/v1/reviews/
// @desc    get reviews
export const getReviews = handleAsync(async (ctx) => {
  const bookId = ctx.state.book;
  const userId = ctx.state.user;

  const result = await findReviews(bookId ? bookId : { userId });

  result.length > 0
    ? sendResponse(ctx, 200, {
        response: {
          success: true,
          data: result,
        },
      })
    : sendResponse(ctx, 400, {
        response: {
          success: false,
          message: "No reviews found",
        },
      });
});


// @route   POST/api/v1/reviews/
// @desc    update review
export const updateReview = handleAsync(async (ctx) => {
  const { reviewId, ...reviewUpdateData } = ctx.state.reviews;
  const timestamp = new Date();
  const result = await updateReviewById(reviewId, {
    ...reviewUpdateData,
    updateAt: timestamp,
  });
  
  result.modifiedCount > 0
    ? sendResponse(ctx, 200, {
        response: {
          success: true,
          message: "Review updated successfully",
        },
      })
    : sendResponse(ctx, 400, {
        response: {
          success: false,
          message: "Review is same",
        },
      });
});


// @route   DELETE/api/v1/reviews/
// @desc    delete review
export const removeReview = handleAsync(async (ctx) => {
  const reviewId = ctx.state.shared;
  const result = await deleteReview(reviewId);

  result.deletedCount > 0
    ? sendResponse(ctx, 200, {
        response: {
          success: true,
          message: "Review deleted",
        },
      })
    : sendResponse(ctx, 400, {
        response: {
          success: false,
          message: "Review not delete, please try again",
        },
      });
});
