import Router from "koa-router";
import {
  followUser,
  getFollowers,
  getFollowing,
  unfollowUser,
} from "../controller/follow.js";
import { auth } from "../middleware/auth.js";
import { validator } from "../middleware/validator.js";
import {
  isBodyEmpty,
  IsUserExist,
  validatepage,
  validateSearchTerm,
  validateSortOrder,
} from "../validator/common.js";
import {
  isMutualFollowers,
  isValidFollowingId,
  IsFollowerExist,
} from "../validator/follow.js";

const route = new Router({ prefix: "/follow" });

route.post(
  "/",
  auth,
  validator([
    isBodyEmpty,
    isValidFollowingId,
    IsFollowerExist,
    isMutualFollowers,
  ]),
  followUser
);

route.delete(
  "/",
  auth,
  validator([
    isBodyEmpty,
    isValidFollowingId,
    IsFollowerExist,
    isMutualFollowers,
  ]),
  unfollowUser
);

route.get(
  "/followers",
  auth,
  validator([validateSortOrder, validatepage]),
  getFollowers
);
route.get(
  "/following",
  auth,
  validator([validateSortOrder, validatepage]),
  getFollowing
);

export default route;
