import { handleAsync } from "../middleware/handleAsync.js";
import { findUserById } from "../query/auth.js";
import {
  deleteFriend,
  findFriends,
  findPendingFriends,
  getFriendList,
  insertFriend,
  updateFriend,
} from "../query/friend.js";
import { sendResponse } from "../utils/sendResponse.js";
import { timestamp } from "../utils/timestamp.js";


// @route   POST /api/v1/friend
// @desc    send friend request
export const sendFriendRequest = handleAsync(async (ctx) => {
  const friendData = ctx.state.friend;
  const userId = ctx.state.user;
  const result = await insertFriend({
    ...friendData,
    status: 0,
    userId,
    createdAt: timestamp(),
    updatedAt: timestamp(),
  });

  result
    ? sendResponse(ctx, 200, {
        response: {
          success: true,
          message: "Friend request send",
        },
      })
    : sendResponse(ctx, 400, {
        response: {
          success: true,
          message: "Friend request not send, please try agian",
        },
      });
});

// @route   POST /api/v1/friend/accept
// @desc    accept friend request
export const acceptFriendRequst = handleAsync(async (ctx) => {
  const user = ctx.state.user;
  const friend = ctx.state?.friend?.friendId;
  const result = await updateFriend({ friendId: user, userId: friend });

  result.modifiedCount
    ? sendResponse(ctx, 200, {
        response: {
          success: true,
          message: "Accepted Friend Requested",
        },
      })
    : sendResponse(ctx, 400, {
        response: {
          success: false,
          message: "Not accepted, please try again",
        },
      });
});

// @route   DELETE /api/v1/friend
// @desc    reject or remove friend
export const removeFriend = handleAsync(async (ctx) => {
  const friendId = ctx.state.friend?.friendId;
  const userId = ctx.state.user;
  const result = await deleteFriend({ userId, friendId });

  result.deletedCount === 1
    ? sendResponse(ctx, 200, {
        response: {
          success: true,
          message: "Friend remove",
        },
      })
    : sendResponse(ctx, 400, {
        response: {
          success: false,
          message: "Not removed friend, please try again",
        },
      });
});

// @route   GET /api/v1/friend/my
// @desc    get user friend
export const getAcceptedFriendList = handleAsync(async (ctx) => {
  const userId = ctx.state.user;
  const { sortOrder, page, limit } = ctx.state.shared;

  const result = await getFriendList(userId, sortOrder, page, limit);

  return result.length > 0
    ? sendResponse(ctx, 200, {
        response: {
          success: true,
          data: result,
        },
      })
    : sendResponse(ctx, 400, {
        response: {
          success: false,
          message: "No friends found",
        },
      });
});

// @route   POST /api/v1/friend/pending
// @desc    get user pending friend request
export const getPendingFriendList = handleAsync(async (ctx) => {
  const userId = ctx.state.user;
  const { sortOrder, page, limit } = ctx.state.shared;

  const result = await findPendingFriends(
    { friendId: userId, status: 0 },
    sortOrder,
    page,
    limit
  );

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
          message: "No Pending request found",
        },
      });
});
