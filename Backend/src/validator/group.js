import { findUserById } from "../query/auth.js";
import { findOneFriend } from "../query/friend.js";
import { findGroupById, findMemberById } from "../query/group.js";
import {
  isValidateId,
  isValidDescription,
  isValidName,
} from "../shared/index.js";

export const validateGroupName = (ctx) => {
  const groupName = ctx.request.body?.groupName;

  if (!groupName && ctx.request.method === "POST")
    return {
      field: "Group Name",
      message: "Please proivde group name",
    };

  if (groupName) {
    const { success, message } = isValidName("Group Name", groupName, 1, 5);

    if (!success)
      return {
        field: "Group Name",
        message,
      };
  }
  ctx.state.group = {
    ...ctx.state.group,
    ...(groupName ? { groupName } : {}),
  };
};

export const validGroupDescription = (ctx) => {
  const groupDescription = ctx.request.body?.groupDescription;

  if (!groupDescription && ctx.request.method === "POST")
    return {
      field: "Group description",
      message: "Please provide group description",
    };

  if (groupDescription) {
    const { success, message } = isValidDescription(groupDescription, 3, 10);

    if (!success)
      return {
        field: "Group description",
        message,
      };
  }

  ctx.state.group = {
    ...ctx.state.group,
    ...(groupDescription ? { groupDescription } : {}),
  };
};

export const validateIsPrivate = (ctx) => {
  const isPrivate = ctx.request.body?.isPrivate;

  if (isPrivate && typeof isPrivate !== "boolean")
    return {
      field: "Group private",
      message: "Please provide valid group private",
    };

  ctx.state.group = {
    ...ctx.state.group,
    ...(isPrivate ? { isPrivate } : { isPrivate: false }),
  };
};

export const isValidGroupId = (ctx) => {
  const groupId = ctx.params?.groupId || ctx.request.body?.groupId;

  if (!groupId)
    return {
      field: "Group Id",
      message: "Please provide group Id",
    };

  if (groupId && !isValidateId(groupId))
    return {
      field: "Group Id",
      message: "Please provide valid Group Id",
    };

  ctx.state.group = {
    ...ctx.state.group,
    ...(groupId ? { groupId } : {}),
  };
};

export const isGroupExist = async (ctx) => {
  const groupId = ctx.state.group?.groupId;

  if (groupId) {
    const result = await findGroupById({ groupId });
    if (!result)
      return {
        field: "Group Id",
        message: "Group does not exist",
      };
  }
};

export const validateRole = (ctx) => {
  const role = ctx.request.body?.role;

  if (!role)
    return {
      field: "role",
      message: "Please proivde user's role",
    };

  if (typeof role !== "string" || !["A", "M", "U"].includes(role))
    return {
      field: "role",
      message: "PLease provide valid role",
    };

  ctx.state.group.member = {
    ...ctx.state.group.member,
    ...(role ? { role } : {}),
  };
};

export const validateMember = async (ctx) => {
  const memberId = ctx.request.body?.memberId;
  const userId = ctx.state.user;

  if (userId === memberId)
    return {
      field: "Group Member",
      message: "You cannot send request to yourself",
    };

  if (memberId) {
    const userExist = await findUserById(memberId);
    if (!userExist)
      return {
        field: "Member",
        message: "Member user does not exist",
      };
  }

  ctx.state.group.member = {
    ...ctx.state.group.member,
    ...(memberId ? { memberId } : {}),
  };
};

export const isAlreadyMember = async (ctx) => {
  let memberId = ctx.state.group?.member?.memberId;
  if (ctx.request.url.endsWith("/join")) memberId = ctx.state.user;

  const groupId = ctx.state.group?.groupId;
  const memberExist = await findMemberById({ memberId, groupId });
  if (memberExist)
    return {
      field: "Group Member",
      message: "User is alreay a member of this group",
    };
};

export const isGroupPublic = async (ctx) => {
  const groupId = ctx.state.group?.groupId;
  const group = await findGroupById({ groupId });

  if (group && group.isPrivate)
    return {
      field: "Group",
      message: "Group is not public",
    };
};

export const isNotMember = async (ctx) => {
  const memberId = ctx.state.user;
  const groupId = ctx.state.group?.groupId;
  const userExist = await findMemberById({ memberId, groupId });

  if (!userExist)
    return {
      field: "Member",
      message: "Member user does not exist",
    };
};

export const isFriend = async (ctx) => {
  const userId = ctx.state.user;
  const memberId = ctx.state.group?.member?.memberId;

  const result = await findOneFriend({
    $or: [
      { friendId: userId, userId: memberId },
      { friendId: memberId, userId },
    ],
  });

  if (!result)
    return {
      field: "Member Friend",
      message: "You are not friends",
    };
};
