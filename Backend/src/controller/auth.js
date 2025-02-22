import { handleAsync } from "../middleware/handleAsync.js";
import { sendResponse } from "../utils/sendResponse.js";
import { createId } from "../utils/createId.js";
import { hashPassword } from "../utils/password.js";
import { insertUser, updateUser } from "../query/auth.js";
import { createVerificationLink } from "../utils/verificationLink.js";
import { sendEmailMail } from "../utils/sendMail.js";
import { generateToken } from "../utils/token.js";

// @route   POST /api/v1/auth/register
// @desc    register user
export const registerUser = handleAsync(async (ctx) => {
  const userData = ctx.state.user;

  const userId = createId();
  const hashedPassword = await hashPassword(userData.password);
  const timestamp = new Date();

  const result = await insertUser({
    ...userData,
    userId,
    password: hashedPassword,
    allowPublish: false,
    isVerified: false,
    createdAt: timestamp,
    updatedAt: timestamp,
  });

  if (!result) {
    sendResponse(ctx, 400, {
      response: {
        success: false,
        message: "User not registered, please try again",
      },
    });
    return;
  }

  const link = createVerificationLink(userId);

  const mailData = {
    fullName: `${userData.firstName} ${userData.lastName}`,
    link,
  };

  if (!(await sendEmailMail(userData.email, "verifyUser", mailData))) {
    sendResponse(ctx, 400, {
      response: { success: false, message: "Email not sent, please try again" },
    });
    return;
  }

  sendResponse(ctx, 200, {
    response: { success: true, message: "Email sent, please verify" },
  });
});

// @route GET /api/v1/auth
// @desc user link verification
export const verifyUser = handleAsync(async (ctx) => {
  const { userId } = ctx.state.user;
  const result = await updateUser(userId, {
    isVerified: true,
    updatedAt: new Date(),
  });

  if (result.modifiedCount === 0) {
    sendResponse(ctx, 400, {
      response: { success: false, message: "User not verified" },
    });
    return;
  }
  sendResponse(ctx, 200, {
    response: { success: true, message: "User verified, please login" },
  });
});

// @route   POST /api/v1/auth/login
// @desc    login user
export const loginUser = handleAsync(async (ctx) => {
  const userData = ctx.state.user;
  const token = generateToken({ id: userData.userId }, "2d");
  if (!token)
    sendResponse(ctx, 400, {
      response: {
        success: false,
        message: "User not logged in, please try again",
      },
    });
  ctx.set("Authorization", `${token}`);
  sendResponse(ctx, 200, {
    response: { success: true, message: "User logged in successfully" },
    data: token,
  });
});
