import KoaRouter from "koa-router";
import authRoute from "../routes/auth.js";
import booksRoute from "../routes/books.js";
import reviewRoute from "../routes/reviews.js";
import postRoute from "../routes/post.js";

const router = new KoaRouter({ prefix: "/api/v1" });

const ROUTERS = [authRoute, booksRoute, reviewRoute, postRoute];
ROUTERS.forEach((route) => {
  router.use(route.routes()).use(route.allowedMethods());
});
export default router;
