import Router from "koa-router";
import { chat } from "../controller/index.js";
import { auth } from "../middleware/auth.js";
import { validator } from "../middleware/validator.js";
import { isBodyEmpty } from "../validator/common.js";
import {
  isGroupExist,
  isNotMember,
  isValidGroupId,
} from "../validator/group.js";
const route = new Router({ prefix: "/chat" });

route.post(
  "/",
  auth,
  validator([isBodyEmpty, isValidGroupId, isGroupExist, isNotMember]),
  chat
);

export default route;
