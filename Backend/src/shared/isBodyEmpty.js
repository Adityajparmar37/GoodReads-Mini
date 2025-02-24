export const isBodyEmpty = (ctx) => {
  if (!ctx.request.body || Object.keys(ctx.request.body).length === 0) {
    ctx.throw(400, "Please provide data");
  }
};
