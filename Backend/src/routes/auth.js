import Router from "koa-router";
import { registerUser, loginUser, verifyUser } from "../controller/index.js";
import { validator } from "../middleware/validator.js";
import {isBodyEmpty} from "../shared/index.js"
import {
  validatePassword,
  validateEmail,
  isUserExist,
  validateLoginPassword,
  validateLoginCredential,
  validateFirstName,
  validateLastName,
  validateToken,
  isUserVerified,
} from "../validator/auth.js";

const route = new Router({ prefix: "/auth" });

route.post(
  "/register",
  validator([
    isBodyEmpty,
    validateFirstName,
    validateLastName,
    validateEmail,
    validatePassword,
    isUserExist,
  ]),
  registerUser
);

route.get("/", validator([validateToken]), verifyUser);

route.post(
  "/login",
  validator([
    isBodyEmpty,
    validateEmail,
    validateLoginPassword,
    validateLoginCredential,
    isUserVerified,
  ]),
  loginUser
);

export default route;
