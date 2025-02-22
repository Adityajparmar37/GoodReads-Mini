import Koa from "koa";
import bodyParser from "koa-bodyparser";
import router from "./src/routes/index.js";
import errorHandler from "./src/middleware/errorHandler.js";

const app = new Koa();

// Global error handler middleware
app.use(errorHandler);
app.use(bodyParser());

app.use(router.routes()).use(router.allowedMethods());

export default app;
