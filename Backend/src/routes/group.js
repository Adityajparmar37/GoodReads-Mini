import Router from "koa-router";
import {
  createGroup,
  removeGroup,
  getGroup,
  getGroups,
  addMember,
  updateGroup,
  getMembers,
  joinGroup,
} from "../controller/index.js";
import {
  validateGroupName,
  validGroupDescription,
  validateIsPrivate,
  isValidGroupId,
  isGroupExist,
  validateRole,
  isAlreadyMember,
  validateMember,
  isGroupPublic,
} from "../validator/group.js";
import {
  isBodyEmpty,
  IsUserExist,
  validatepage,
  validateSearchTerm,
  validateSortOrder,
} from "../validator/common.js";
import { auth } from "../middleware/auth.js";
import { validator } from "../middleware/validator.js";
import { checkAccess, setPermissions } from "../middleware/permission.js";

const route = new Router({ prefix: "/group" });

route.post(
  "/",
  auth,
  validator([
    isBodyEmpty,
    validateGroupName,
    validGroupDescription,
    validateIsPrivate,
  ]),
  createGroup
);

route.patch(
  "/:groupId",
  auth,
  checkAccess(["O", "A", "M", "U"]),
  validator([
    isBodyEmpty,
    isValidGroupId,
    isGroupExist,
    validateGroupName,
    validGroupDescription,
    validateIsPrivate,
  ]),
  updateGroup
);

route.get(
  "/my",
  auth,
  validator([validateSortOrder, validateSearchTerm, validatepage]),
  getGroups
);

route.get(
  "/",
  auth,
  validator([validateSortOrder, validateSearchTerm, validatepage]),
  getGroups
);

route.post(
  "/join",
  auth,
  validator([
    isBodyEmpty,
    isValidGroupId,
    isGroupExist,
    isGroupPublic,
    isAlreadyMember,
  ]),
  joinGroup
);

route.get(
  "/members/:groupId",
  auth,
  validator([isValidGroupId, isGroupExist, validateSortOrder, validatepage]),
  getMembers
);

route.get(
  "/:groupId",
  auth,
  validator([isValidGroupId, isGroupExist]),
  getGroup
);

route.delete(
  "/:groupId",
  auth,
  checkAccess(["O", "A", "M"]),
  validator([isValidGroupId, isGroupExist]),
  removeGroup
);

route.post(
  "/invite",
  auth,
  checkAccess(["O", "A", "M", "U"]),
  validator([
    isBodyEmpty,
    isValidGroupId,
    isGroupExist,
    validateRole,
    IsUserExist,
    validateMember,
    isAlreadyMember,
  ]),
  setPermissions,
  addMember
);

export default route;
