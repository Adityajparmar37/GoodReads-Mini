export const sendResponse = (ctx, statusCode, { response, data, error }) => {
  ctx.status = statusCode;
  ctx.body = {
    response,
    data,
    error,
  };
};
