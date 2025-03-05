import { findUserById } from "../query/auth.js";
import { findFollower } from "../query/follow.js";
import { isValidateId } from "../shared/index.js";

export const isValidFollowingId = (ctx) => {
  const followingId = ctx.request.body?.followingId;
  const followerId = ctx.state.user;

  if (!followingId)
    return {
      field: "following",
      message: "Please provide following user Id",
    };

  if (followerId === followingId)
    return {
      field: "following",
      message: "You cannot follow yourself",
    };

  if (!isValidateId(followingId))
    return {
      field: "following",
      message: "Please provide valid followin user Id",
    };

  ctx.state.follow = {
    ...ctx.state.follow,
    ...(followingId ? { followingId } : {}),
  };
};

export const isMutualFollowers = async (ctx) => {
  const followeeId = ctx.state.user;
  const followingId = ctx.state.follow?.followingId;
  const method = ctx.request.method;
  const result = await findFollower({ followeeId, followingId });
  if (result && method === "POST")
    return {
      field: "Follow",
      message: "You already follow",
    };
  else if (!result && method === "DELETE")
    return {
      field: "Follow",
      message: "You already unfollow",
    };
};

export const IsFollowingUserExist = async (ctx) => {
  const followingId = ctx.state.follow?.followingId;

  let followingUser = null;
  if (followingId) {
    const followingUser = await findUserById(followingId);
    if (!followingUser)
      return {
        field: "Following",
        message: "Following user does not exist",
      };
  }

  ctx.state.follow = {
    ...ctx.state.follow,
    ...(followingUser
      ? { userName: `${followingUser.firstName} ${followingUser.lastName}` }
      : {}),
  };
};
