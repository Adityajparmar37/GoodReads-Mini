import Koa from "koa";
import bodyParser from "koa-bodyparser";
import router from "./src/routes/index.js";
import errorHandler from "./src/middleware/errorHandler.js";
import { Server } from "socket.io";
import { createServer } from "http";

const app = new Koa();

//socket takes http createServer instance
const server = createServer(app.callback());
const io = new Server(server, {
  cors: {
    origin: "*",
    methods: ["GET", "POST"],
  },
});

// Global error handler middleware
app.use(errorHandler);
app.use(bodyParser());

// logger
app.use(async (ctx, next) => {
  await next();

  console.log(
    `${new Date().toLocaleString()} - ${ctx.request.origin} - ${ctx.method} ${
      ctx.url
    } - ${ctx.status}`
  );
});

app.use(router.routes()).use(router.allowedMethods());

export { server, io };
