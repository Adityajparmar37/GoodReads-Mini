import Router from "koa-router";
import { auth } from "../middleware/auth.js";
import { validator } from "../middleware/validator.js";

const router = new Router();

router.get("/health", async (ctx) => {
  ctx.body = { status: "OK", app: process.env.APP_NAME };
});

export default router;
