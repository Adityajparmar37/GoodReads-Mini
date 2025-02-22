// src/routes/index.js
import KoaRouter from "koa-router";
import authRoute from "../routes/auth.js";

const router = new KoaRouter({ prefix: "/api/v1" });

const ROUTERS = [authRoute];

ROUTERS.forEach((route) => {
  router.use(route.routes()).use(route.allowedMethods());
});

export default router;
