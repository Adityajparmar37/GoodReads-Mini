import Router from "koa-router";
import { auth } from "../middleware/auth.js";
import { validator } from "../middleware/validator.js";
import {
  isBodyEmpty,
  validatepage,
  validateSortOrder,
} from "../validator/common.js";
import {
  sendFriendRequest,
  removeFriend,
  acceptFriendRequst,
  getAcceptedFriendList,
  getPendingFriendList,
} from "../controller/index.js";
import {
  isAlreadyFriend,
  isFriendExist,
  isFriendsNot,
  isValidFriendId,
} from "../validator/friend.js";

const route = new Router({ prefix: "/friend" });

route.post(
  "/",
  auth,
  validator([isBodyEmpty, isValidFriendId, isFriendExist, isAlreadyFriend]),
  sendFriendRequest
);

route.post(
  "/accept",
  auth,
  validator([
    isBodyEmpty,
    isValidFriendId,
    isFriendExist,
    isAlreadyFriend,
    isFriendsNot,
  ]),
  acceptFriendRequst
);

route.get(
  "/my",
  auth,
  validator([validatepage, validateSortOrder]),
  getAcceptedFriendList
);

route.get(
  "/pending",
  auth,
  validator([validatepage, validateSortOrder]),
  getPendingFriendList
);

route.delete(
  "/",
  auth,
  validator([isBodyEmpty, isValidFriendId, isFriendExist, isFriendsNot]),
  removeFriend
);

export default route;
