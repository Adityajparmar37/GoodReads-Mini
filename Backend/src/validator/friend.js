import { findUserById } from "../query/auth.js";
import { findOneFriend } from "../query/friend.js";
import { isValidateId } from "../shared/index.js";

export const isValidFriendId = (ctx) => {
  const friendId = ctx.request.body?.friendId;
  const userId = ctx.state.user;

  if (!friendId)
    return {
      field: "Friend Id",
      message: "Please provide friend Id",
    };

  if (userId === friendId)
    return {
      field: "Friend Id",
      message: "You cannot send friend request to yourself",
    };

  if (!isValidateId(friendId))
    return {
      field: "Friend Id",
      message: "Please provide valid friend Id",
    };

  ctx.state.friend = {
    ...ctx.state.friend,
    ...(friendId ? { friendId } : {}),
  };
};

export const isFriendExist = async (ctx) => {
  const friendId = ctx.state.friend?.friendId;
  let friendExist = null;

  if (friendId) {
    friendExist = await findUserById(friendId);
    if (!friendExist)
      return {
        field: "Friend Id",
        message: "Friend does not exist",
      };
  }

  ctx.state.friend = {
    ...ctx.state.friend,
    ...(friendId ? { friendId } : {}),
  };
};

export const isAlreadyFriend = async (ctx) => {
  const friend = ctx.state.friend?.friendId;
  const user = ctx.state.user;
  let result = null;
  if (ctx.request.url.endsWith("/accept")) {
    result = await findOneFriend({ friendId: user, userId: friend });
  } else {
    result = await findOneFriend({ friendId: friend, userId: user });
  }

  if (result?.status)
    return {
      field: "Friends",
      message: "You are already friend",
    };
};

export const isFriendsNot = async (ctx) => {
  const friend = ctx.state.friend?.friendId;
  const user = ctx.state.user;
  let result = null;
  if (ctx.request.url.endsWith("/accept")) {
    result = await findOneFriend({ userId: friend, friendId: user });
  } else {
    result = await findOneFriend({ friendId: friend, userId: user });
  }
  if (!result)
    return {
      field: "Friends",
      message: "You are not friends",
    };
};
