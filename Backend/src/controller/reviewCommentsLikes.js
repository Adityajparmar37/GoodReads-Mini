import { handleAsync } from "../middleware/handleAsync.js";
import {
  deleteReviewComment,
  insertReviewComment,
  updateReviewCommentById,
  findReviewComments,
  deleteReviewLike,
  insertReviewLike,
  findReviewLike,
} from "../query/reviewCommentsLikes.js";
import { createId } from "../utils/createId.js";
import { sendResponse } from "../utils/sendResponse.js";
import { timestamp } from "../utils/timestamp.js";

// @route   POST/api/v1/comments/
// @desc    add comments on review
export const addReviewComment = handleAsync(async (ctx) => {
  const comment = ctx.state.reviewComment?.comment;
  const reviewId = ctx?.state?.reviews?.reviewId;
  const userId = ctx.state.user;
  const result = await insertReviewComment({
    comment,
    reviewId,
    userId,
    commentId: createId(),
    createdAt: timestamp(),
    updatedAt: timestamp(),
  });

  result.acknowledged
    ? sendResponse(ctx, 200, {
        response: {
          success: true,
          message: "comment added",
        },
      })
    : sendResponse(ctx, 400, {
        response: {
          success: false,
          message: "Comment not added, please try again",
        },
      });
});

// @route   DELETE/api/v1/comments/:commentId
// @desc    remove comments on review
export const removeReviewComment = handleAsync(async (ctx) => {
  const commentId = ctx.state.reviewComment;
  const result = await deleteReviewComment(commentId);

  result.deletedCount > 0
    ? sendResponse(ctx, 200, {
        response: {
          success: true,
          message: "Comment Deleted",
        },
      })
    : sendResponse(ctx, 400, {
        response: {
          success: false,
          message: "Comment not deleted, please try again",
        },
      });
});

// @route   PUT/api/v1/comments/commentId
// @desc    remove comments on review
export const updateReviewComment = handleAsync(async (ctx) => {
  const commentId = ctx.state.reviewComment?.commentId;
  const updateReviewCommentData = ctx.state.reviewComment?.comment;
  const result = await updateReviewCommentById(
    { commentId },
    updateReviewCommentData
  );

  if (!result.acknowledged) {
    sendResponse(ctx, 400, {
      response: {
        success: false,
        message: "Comment not updated, please try again",
      },
    });
    return;
  }

  result.modifiedCount > 0
    ? sendResponse(ctx, 200, {
        response: {
          success: true,
          message: "Comment updated",
        },
      })
    : sendResponse(ctx, 400, {
        response: {
          success: false,
          message: "Comment remain same",
        },
      });
});

// @route   GET/api/v1/comments/:commentId
// @desc    get comments of review
export const getReviewComments = handleAsync(async (ctx) => {
  const reviewId = ctx.state.reviews?.reviewId;
  const limit = ctx.state?.shared?.limit;
  const result = await findReviewComments({ reviewId }, limit);

  result
    ? sendResponse(ctx, 200, {
        response: {
          success: true,
          data: result,
        },
      })
    : sendResponse(ctx, 400, {
        response: {
          success: false,
          message: "No Comments Found",
        },
      });
});

// @route   GET/api/v1/comments/like/:reviewId
// @desc    like or dislike review
export const likeReview = handleAsync(async (ctx) => {
  const reviewId = ctx.state.reviews?.reviewId;
  const userId = ctx.state.user;
  const findReviewLike = await deleteReviewLike({ reviewId, userId });

  if (findReviewLike.deletedCount > 0) {
    sendResponse(ctx, 200, {
      response: {
        success: true,
        message: "dislike",
      },
    });
    return;
  }

  const addReviewLike = await insertReviewLike({
    reviewId,
    userId,
    like: true,
    createdAt: timestamp(),
    updatedAt: timestamp(),
  });

  addReviewLike.acknowledged && findReviewLike.acknowledged
    ? sendResponse(ctx, 200, {
        response: {
          success: true,
          message: "Like the review",
        },
      })
    : sendResponse(ctx, 400, {
        response: {
          success: false,
          message: "Not liked, please try again",
        },
      });
});

// @route   GET/api/v1/comments/getlikes/:reviewId
// @desc    get likes of review
export const getReviewLikes = handleAsync(async (ctx) => {
  const reviewId = ctx.state.reviews?.reviewId;
  console.log(reviewId);
  const result = await findReviewLike(reviewId);

  result
    ? sendResponse(ctx, 200, {
        response: {
          success: true,
          data: result,
        },
      })
    : sendResponse(ctx, 400, {
        response: {
          success: false,
          message: "No Like Found",
        },
      });
});
