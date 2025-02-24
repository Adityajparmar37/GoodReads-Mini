import KoaRouter from "koa-router";
import authRoute from "../routes/auth.js";
import booksRoute from "../routes/books.js";

const router = new KoaRouter({ prefix: "/api/v1" });

const ROUTERS = [authRoute, booksRoute];
ROUTERS.forEach((route) => {
  router.use(route.routes()).use(route.allowedMethods());
});
export default router;
