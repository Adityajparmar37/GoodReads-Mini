import { deleteFacebookPost, postToFacebook } from "../services/facebook.js";
import { postToInstagram } from "../services/instagram.js";

export const sortMapping = Object.freeze({
  AESC: 1,
  DESC: -1,
});

export const platformMapping = Object.freeze({
  Facebook: 1,
  Instagram: 2,
});

export const friendStatus = Object.freeze({
  pending: 0,
  accepted: 1,
});

export const reversePlatformMapping = Object.freeze({
  1: "Facebook",
  2: "Instagram",
});

//Social Media Service Mapping
export const platformActionsToCreatePost = Object.freeze({
  1: postToFacebook,
  2: postToInstagram,
});

export const platformActionsToDeletePost = Object.freeze({
  1: deleteFacebookPost,
});

export const bookStatusMapping = Object.freeze({
  CR: "Currently reading",
  WR: "Want to read",
  R: "read",
});

export const messageTypeMapping = Object.freeze({
  T: "Text",
  P: "Post",
});

//role's permission mapping
export const permissionsLists = new Set([
  "canEditGroup",
  "canDeleteGroup",
  "canAddMembers",
]);

export const rolePermissions = {
  O: Object.freeze({
    canEditGroup: true,
    canDeleteGroup: true,
    canAddMembers: true,
  }),
  A: Object.freeze({
    canEditGroup: true,
    canDeleteGroup: true,
    canAddMembers: true,
  }),
  M: Object.freeze({
    canEditGroup: true,
  }),
};

export const restrictedMembers = {
  U: Object.freeze({ canDeleteGroup: false, canEditGroup: false }),
};

//access mapping
export const groupAccess = {
  DELETE: {
    canDeleteGroup: ["/api/v1/group/:groupId"],
  },
  PATCH: {
    canEditGroup: ["/api/v1/group/:groupId"],
  },
  POST: {
    canAddMembers: ["/api/v1/group/invite"],
  },
};
