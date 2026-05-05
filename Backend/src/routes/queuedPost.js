import Router from "koa-router";
import { queuePost } from "../controller/queuedPost.js";
import { auth } from "../middleware/auth.js";
import { validator } from "../middleware/validator.js";
import { isBookValid, validateBookId } from "../validator/book.js";
import { isBodyEmpty } from "../validator/common.js";
import { validateSocialMediaPlatform } from "../validator/post.js";

const router = new Router({ prefix: "/queued-post" });

router.post(
  "/:bookId",
  auth,
  validator([
    isBodyEmpty,
    validateBookId,
    isBookValid,
    validateSocialMediaPlatform,
  ]),
  queuePost
);

export default router;
