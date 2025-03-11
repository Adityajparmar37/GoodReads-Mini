import { isValidateId, isValidComment } from "../shared/index.js";
import { findCommentById } from "../query/reviewCommentsLikes.js";

export const validReviewComment = (ctx) => {
  const comment = ctx.request.body.comment;

  if (comment) {
    const { success, message } = isValidComment(comment);

    if (!success)
      return {
        field: "Review comment",
        message,
      };
  }
  ctx.state.reviewComment = {
    ...ctx.state.reviewComment,
    ...(comment ? { comment } : {}),
  };
};

export const isCommentIdValid = (ctx) => {
  const commentId = ctx.params.commentId;

  if (!isValidateId(commentId))
    return {
      field: "Review Comment Id",
      message: "Please provide valid comment Id",
    };

  ctx.state.reviewComment = {
    ...ctx.state.reviewComment,
    ...(commentId ? { commentId } : {}),
  };
};

export const isCommentExist = async (ctx) => {
  const commentId = ctx.state.reviewComment?.commentId;
  const commentExist = await findCommentById({ commentId });

  if (!commentExist)
    return {
      field: "Review Comment",
      message: "Review not found",
    };
};

export const validateLike = (ctx) => {
  const like = ctx.query?.like;
  if (like !== undefined && typeof like !== "string")
    return {
      field: "review like",
      message: "Please provide valid review like",
    };

  ctx.state.reviewlike = {
    ...ctx.state.reviewlike,
    ...(like ? { like } : { like: false }),
  };
};
