import { findUserById } from "../query/auth.js";
import { sendResponse } from "../utils/sendResponse.js";
import { verifyToken } from "../utils/token.js";

export const auth = async (ctx, next) => {
  const token = ctx.header.authorization?.split(" ")[1];

  if (!token)
    return sendResponse(ctx, 401, {
      response: { success: false, message: "Unauthorized: token not provided" },
    });

  const isUserVerified = verifyToken(token);
  if (!isUserVerified.success)
    return sendResponse(ctx, 401, {
      response: { success: false, message: isUserVerified.message },
    });

  const userExist = await findUserById(isUserVerified.message.id);

  if (!userExist)
    return sendResponse(ctx, 401, {
      response: {
        success: false,
        message: "User does not exist, please register",
      },
    });

  if (!userExist.isVerified)
    return sendResponse(ctx, 400, {
      response: {
        success: false,
        message: "User is not verified, please verify",
      },
    });

  ctx.state.user = isUserVerified.message.id;
  await next();
};
