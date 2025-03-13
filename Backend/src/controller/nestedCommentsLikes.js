import { handleAsync } from "../middleware/handleAsync.js";
import {
  deleteNestedComment,
  deleteCommentLike,
  findCommentLike,
  findNestedComments,
  insertNestedComment,
  insertCommentLike,
  updateNestedCommentById,
} from "../query/nestedCommentsLikes.js";
import { createId } from "../utils/createId.js";
import { sendResponse } from "../utils/sendResponse.js";
import { timestamp } from "../utils/timestamp.js";

// @route   POST/api/v1/nestedComments/
// @desc    add nested comments on main comments
export const addNestedComment = handleAsync(async (ctx) => {
  const nestedComment = ctx.state.nestedComment?.comment;
  const mainCommentId = ctx.state.reviewComment?.commentId;
  const userId = ctx.state.user;
  const result = await insertNestedComment({
    nestedComment,
    mainCommentId,
    userId,
    nestedCommentId: createId(),
    createdAt: timestamp(),
    updatedAt: timestamp(),
  });

  result.acknowledged
    ? sendResponse(ctx, 200, {
        response: {
          success: true,
          message: "nested comment added",
        },
      })
    : sendResponse(ctx, 400, {
        response: {
          success: false,
          message: "nested Comment not added, please try again",
        },
      });
});

// @route   DELETE/api/v1/nestedComments/:nestedCommentId
// @desc    remove nested comment on main comment
export const removeNestedComment = handleAsync(async (ctx) => {
  const nestedCommentId = ctx.state.nestedComment?.nestedCommentId;
  const result = await deleteNestedComment({ nestedCommentId });

  result.deletedCount > 0
    ? sendResponse(ctx, 200, {
        response: {
          success: true,
          message: "Nested Comment Deleted",
        },
      })
    : sendResponse(ctx, 400, {
        response: {
          success: false,
          message: "Nested Comment not deleted, please try again",
        },
      });
});

// @route   PUT/api/v1/nestedComments/:nestedCommentId
// @desc    remove nested Comment on main comments
export const updateNestedComment = handleAsync(async (ctx) => {
  const nestedCommentId = ctx.state.nestedComment?.nestedCommentId;
  const updateNestedCommentData = ctx.state.nestedComment?.comment;
  const result = await updateNestedCommentById(
    { nestedCommentId },
    updateNestedCommentData
  );

  if (!result.acknowledged) {
    sendResponse(ctx, 400, {
      response: {
        success: false,
        message: "Nested Comment not updated, please try again",
      },
    });
    return;
  }

  result.modifiedCount > 0
    ? sendResponse(ctx, 200, {
        response: {
          success: true,
          message: "Nested Comment updated",
        },
      })
    : sendResponse(ctx, 400, {
        response: {
          success: false,
          message: "Nested Comment remain same",
        },
      });
});

// @route   GET/api/v1/nestedComments/:commentId
// @desc    get nested comments of main comment
export const getNestedComments = handleAsync(async (ctx) => {
  const commentId = ctx.state.reviewComment?.commentId;
  const limit = ctx.state?.shared?.limit;
  const result = await findNestedComments({ mainCommentId: commentId }, limit);

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

// @route   GET/api/v1/nestedComment/like/:nestedCommentId
// @desc    like or dislike nested comment
export const likeNestedComments = handleAsync(async (ctx) => {
  const commentId = ctx.state.reviews?.commentId;
  const userId = ctx.state.user;
  const findCommentLike = await deleteCommentLike({
    mainComment: commentId,
    userId,
  });

  if (findCommentLike.deletedCount > 0) {
    sendResponse(ctx, 200, {
      response: {
        success: true,
        message: "dislike",
      },
    });
    return;
  }

  const addCommentLike = await insertCommentLike({
    mainComment: commentId,
    userId,
    like: true,
    createdAt: timestamp(),
    updatedAt: timestamp(),
  });

  addCommentLike.acknowledged && findCommentLike.acknowledged
    ? sendResponse(ctx, 200, {
        response: {
          success: true,
          message: "Like the comment",
        },
      })
    : sendResponse(ctx, 400, {
        response: {
          success: false,
          message: "Not liked, please try again",
        },
      });
});

// @route   GET/api/v1/comments/getlikes/:nestedCommentId
// @desc    get likes of nested comment
export const getNestedCommentsLikes = handleAsync(async (ctx) => {
  const commentId = ctx.state.reviews?.commentId;
  const result = await findCommentLike(commentId);

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
