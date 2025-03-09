import { handleAsync } from "../middleware/handleAsync.js";
import {
  deleteGroup,
  deleteMembers,
  findGroup,
  findGroupById,
  insertGroup,
  insertMember,
  updateGroupById,
  findMembers,
} from "../query/group.js";
import { createId } from "../utils/createId.js";
import { timestamp } from "../utils/timestamp.js";
import { sendResponse } from "../utils/sendResponse.js";
import { rolePermissions } from "../utils/mapping.js";

// @route   POST/api/v1/group/
// @desc    create group
export const createGroup = handleAsync(async (ctx) => {
  const userId = ctx.state.user;
  const groupData = ctx.state.group;
  const groupId = createId();
  const groupResult = await insertGroup({
    ...groupData,
    ownerId: userId,
    groupId,
    isPrivate: groupData.isPrivate ?? false,
    createdAt: timestamp(),
    updatedAt: timestamp(),
  });

  if (!groupResult.acknowledged) {
    sendResponse(ctx, 400, {
      response: {
        success: false,
        message: "Group not created, please try again",
      },
    });
    return;
  }

  const insertGroupOwner = await insertMember({
    groupId: groupResult.groupId,
    memberId: userId,
    groupId,
    role: "O",
    permissions: { ...rolePermissions["O"] },
    createdAt: timestamp(),
    updatedAt: timestamp(),
  });

  insertGroupOwner.acknowledged
    ? sendResponse(ctx, 200, {
        response: {
          success: true,
          message: "Group created successfully",
        },
      })
    : sendResponse(ctx, 400, {
        response: {
          success: false,
          message: "Owner not added to group, please try again",
        },
      });
});

// @route   POST/api/v1/group/join
// @desc    join public group
export const joinGroup = handleAsync(async (ctx) => {
  const userId = ctx.state.user;
  const groupId = ctx.state?.group?.groupId;

  const result = await insertMember({
    memberId: userId,
    groupId,
    role: "U",
    permissions: { ...rolePermissions["U"] },
    createdAt: timestamp(),
    updatedAt: timestamp(),
  });

  result.acknowledged
    ? sendResponse(ctx, 200, {
        response: {
          success: true,
          message: "Joined Group",
        },
      })
    : sendResponse(ctx, 400, {
        response: {
          success: false,
          message: "Not Joined Group, please try again",
        },
      });
});

// @route   GET/api/v1/group/:groupId
// @desc    get a group
export const getGroup = handleAsync(async (ctx) => {
  const groupId = ctx.state.group?.groupId;
  const result = await findGroupById({ groupId });

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
          message: "No Group found",
        },
      });
});

// @route   GET/api/v1/group/my
// @desc    get all public groups / private group for user
export const getGroups = handleAsync(async (ctx) => {
  const userId = ctx.state.user;
  const fetchUserOnly = ctx.path.endsWith("/my");
  const { searchTerm, sortOrder, page, limit } = ctx.state.shared;
  const isPrivateGroup = fetchUserOnly
    ? { ownerId: userId }
    : { isPrivate: false };
  const query = {
    ...isPrivateGroup,
    ...(searchTerm && {
      $or: [
        { groupName: { $regex: searchTerm, $options: "i" } },
        { groupDescription: { $regex: searchTerm, $options: "i" } },
      ],
    }),
  };

  const groupsResult = await findGroup(query, sortOrder, page, limit);

  if (groupsResult.length === 0) {
    sendResponse(ctx, 400, {
      response: {
        success: false,
        message: `No ${fetchUserOnly ? "user" : "public"} group found`,
      },
    });
    return;
  }

  groupsResult.length > 0
    ? sendResponse(ctx, 200, {
        response: {
          success: true,
          data: groupsResult,
        },
      })
    : sendResponse(ctx, 400, {
        response: {
          success: false,
          message: "No Groups found",
        },
      });
});

// @route   DELETE/api/v1/group/:groupId
// @desc    delete a group
export const removeGroup = handleAsync(async (ctx) => {
  const groupId = ctx.state.group?.groupId;
  const resultGroupRemove = await deleteGroup({ groupId });

  if (!resultGroupRemove.acknowledged) {
    sendResponse(ctx, 400, {
      response: {
        success: false,
        message: "Group not deleted, please try again",
      },
    });
    return;
  }

  const result = await deleteMembers({ groupId });

  result.deletedCount > 0
    ? sendResponse(ctx, 200, {
        response: {
          success: true,
          message: "Group deleted successfully",
        },
      })
    : sendResponse(ctx, 400, {
        response: {
          success: false,
          message: "Group not delete, please try agian !",
        },
      });
});

// @route   POST/api/v1/group/:groupId
// @desc    update group
export const updateGroup = handleAsync(async (ctx) => {
  const updateData = ctx.state?.group;
  const groupId = ctx.state.group?.groupId;
  const result = await updateGroupById(groupId, updateData);

  if (!result.acknowledged) {
    sendResponse(ctx, 400, {
      response: {
        success: false,
        message: "Group not updated, please try again",
      },
    });
  }

  result.modifiedCount > 0
    ? sendResponse(ctx, 200, {
        response: {
          success: true,
          message: "Group Updated successfully",
        },
      })
    : sendResponse(ctx, 200, {
        response: {
          success: false,
          message: "Group remain same",
        },
      });
});

// @route   POST/api/v1/group/inivte
// @desc    add Member to a group
export const addMember = handleAsync(async (ctx) => {
  const member = ctx.state.group?.member;
  const groupId = ctx.state.group?.groupId;
  const result = await insertMember({
    ...member,
    groupId,
    createdAt: timestamp(),
    updatedAt: timestamp(),
  });

  result.acknowledged
    ? sendResponse(ctx, 200, {
        response: {
          success: true,
          message: "Member added",
        },
      })
    : sendResponse(ctx, 400, {
        response: {
          success: false,
          message: "Invite not send, please try again",
        },
      });
});

// @route   POST/api/v1/group/members/:groupId
// @desc    get all members of group
export const getMembers = handleAsync(async (ctx) => {
  const groupId = ctx.state.group?.groupId;
  const { sortOrder, page, limit } = ctx.state.shared;
  const result = await findMembers(groupId, sortOrder, page, limit);

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
          message: "No members found",
        },
      });
});
