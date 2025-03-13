import { isValidateId, isValidComment } from "../shared/index.js";
import { findNestedCommentById } from "../query/nestedCommentsLikes.js";

export const validNestedComment = (ctx) => {
  const comment = ctx.request.body?.comment;

  if (comment) {
    const { success, message } = isValidComment(comment);

    if (!success)
      return {
        field: "nested comment",
        message,
      };
  }
  ctx.state.nestedComment = {
    ...ctx.state.nestedComment,
    ...(comment ? { comment } : {}),
  };
};

export const isNestedCommentIdValid = (ctx) => {
  const nestedCommentId = ctx.params.nestedCommentId;

  if (!isValidateId(nestedCommentId))
    return {
      field: "Nested Comment Id",
      message: "Please provide valid nested comment Id",
    };

  ctx.state.nestedComment = {
    ...ctx.state.nestedComment,
    ...(nestedCommentId ? { nestedCommentId } : {}),
  };
};

export const isNestedCommentExist = async (ctx) => {
  const nestedCommentId = ctx.state.nestedComment?.nestedCommentId;
  if (nestedCommentId) {
    const nestedCommentExist = await findNestedCommentById({ nestedCommentId });
    if (!nestedCommentExist)
      return {
        field: "Nested Comment",
        message: "Nested commnet not found",
      };
  }
};

export const validateNestedCommentLike = (ctx) => {
  const like = ctx.query?.nestedCommentLike;
  if (like !== undefined && typeof like !== "string")
    return {
      field: "nested commnet like",
      message: "Please provide valid nested commnet like",
    };

  ctx.state.nestedCommentLike = {
    ...ctx.state.nestedCommentLike,
    ...(like ? { like } : { like: false }),
  };
};
