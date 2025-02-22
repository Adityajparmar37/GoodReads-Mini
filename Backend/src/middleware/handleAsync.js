export const handleAsync = (controller) => async (ctx, next) => {
  try {
    await controller(ctx, next);
  } catch (error) {
    //print in slack error
    console.error("Error caught:", error);
    ctx.status = error.status || 500;
    ctx.body = { error: error.message || "Internal Server Error" };
  }
};
