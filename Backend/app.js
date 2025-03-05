import Koa from "koa";
import bodyParser from "koa-bodyparser";
import router from "./src/routes/index.js";
import errorHandler from "./src/middleware/errorHandler.js";

const app = new Koa();

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

export default app;
