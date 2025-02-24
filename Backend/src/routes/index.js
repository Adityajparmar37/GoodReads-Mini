import KoaRouter from "koa-router";
import authRoute from "../routes/auth.js";
import booksRoute from "../routes/books.js";
import reviewRoute from "../routes/reviews.js";

const router = new KoaRouter({ prefix: "/api/v1" });

const ROUTERS = [authRoute, booksRoute, reviewRoute];
ROUTERS.forEach((route) => {
  router.use(route.routes()).use(route.allowedMethods());
});
export default router;
