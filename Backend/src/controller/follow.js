import { handleAsync } from "../middleware/handleAsync.js";
import {
  incrementFollowerCount,
  incrementFollowingCount,
  decrementFollowerCount,
  decrementFollowingCount,
} from "../query/auth.js";
import {
  removeFollower,
  insertFollower,
  findFollowing,
  findFollowers,
} from "../query/follow.js";
import { sendResponse } from "../utils/sendResponse.js";
import { timestamp } from "../utils/timestamp.js";

// @route   POST /api/v1/follow/
// @desc    follow other user
export const followUser = handleAsync(async (ctx) => {
  const followeeId = ctx.state.user;
  const { followingId } = ctx.state.follow;

  const incrementFollowers = await incrementFollowingCount({
    userId: followeeId,
  });

  const incrementFollowing = await incrementFollowerCount({
    userId: followingId,
  });

  const result = await insertFollower({
    followeeId,
    followingId,
    createdAt: timestamp(),
    updatedAt: timestamp(),
  });

  result.acknowledged &&
  incrementFollowers.matchedCount === 1 &&
  incrementFollowing.matchedCount === 1
    ? sendResponse(ctx, 200, {
        response: {
          success: true,
          message: "Following",
        },
      })
    : sendResponse(ctx, 400, {
        response: {
          success: false,
          message: "Not Followed, please try again",
        },
      });
});

// @route   DELETE /api/v1/follow/
// @desc    unfollow user
export const unfollowUser = handleAsync(async (ctx) => {
  const followeeId = ctx.state.user;
  const followingId = ctx.state.follow?.followingId;

  const decrememtFollower = await decrementFollowingCount({
    userId: followeeId,
  });
  const decrememtFollowing = await decrementFollowerCount({
    userId: followingId,
  });
  const result = await removeFollower({
    followeeId,
    followingId,
  });

  result.deletedCount === 1 &&
  decrememtFollower.matchedCount === 1 &&
  decrememtFollowing.matchedCount === 1
    ? sendResponse(ctx, 200, {
        response: {
          success: true,
          message: "unfollow",
        },
      })
    : sendResponse(ctx, 400, {
        response: {
          success: false,
          message: "Not unfollow, please try again",
        },
      });
});

// @route   GET /api/v1/shelf/
// @desc    get user's followers
export const getFollowers = handleAsync(async (ctx) => {
  const userId = ctx.state.user;
  const { sortOrder, page, limit } = ctx.state.shared;
  const result = await findFollowers(userId, sortOrder, page, limit);

  result.length > 0
    ? sendResponse(ctx, 200, {
        response: {
          success: true,
          data: result,
        },
      })
    : sendResponse(ctx, 200, {
        response: {
          success: false,
          message: "No followers found",
        },
      });
});

// @route   GET /api/v1/shelf/
// @desc    get user's following
export const getFollowing = handleAsync(async (ctx) => {
  const userId = ctx.state.user;
  const { sortOrder, page, limit } = ctx.state.shared;
  const result = await findFollowing(userId, sortOrder, page, limit);

  result.length > 0
    ? sendResponse(ctx, 200, {
        response: {
          success: true,
          data: result,
        },
      })
    : sendResponse(ctx, 200, {
        response: {
          success: false,
          message: "No following found",
        },
      });
});
