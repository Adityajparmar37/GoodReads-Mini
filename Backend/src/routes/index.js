import KoaRouter from "koa-router";
import authRoute from "../routes/auth.js";
import booksRoute from "../routes/books.js";
import reviewRoute from "../routes/reviews.js";
import postRoute from "../routes/post.js";
import shelfRoute from "../routes/shelf.js";
import followRoute from "../routes/follow.js";
import friendRoute from "../routes/friend.js";
import groupRoute from "../routes/group.js";
import chatRoute from "../routes/chat.js";

const router = new KoaRouter({ prefix: "/api/v1" });

const ROUTERS = [
  authRoute,
  booksRoute,
  reviewRoute,
  postRoute,
  shelfRoute,
  followRoute,
  friendRoute,
  groupRoute,
  chatRoute,
];

ROUTERS.forEach((route) => {
  router.use(route.routes()).use(route.allowedMethods());
});
export default router;
