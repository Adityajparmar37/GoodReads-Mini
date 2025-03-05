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

//Social Media Service Mapping
export const platformActionsToCreatePost = Object.freeze({
  1: postToFacebook,
  2: postToInstagram,
});

export const platformActionsToDeletePost = Object.freeze({
  1: deleteFacebookPost,
});
