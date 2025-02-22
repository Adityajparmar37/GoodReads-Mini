const errorHandler = async (ctx, next) => {
  try {
    await next();
  } catch (error) {
    ctx.status = error.status || 500;
    ctx.body = {
      success: false,
      message: error.message || "Internal Server Error",
    };
    // print error in slack
    console.error("Error: ", error);
  }
};

export default errorHandler;
