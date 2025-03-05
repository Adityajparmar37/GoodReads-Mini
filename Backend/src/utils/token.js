import jwt from "jsonwebtoken";
import { SECRET_JWT_KEY } from "../config/index.js";

export const generateToken = (payload, expireTime) =>
  jwt.sign(payload, SECRET_JWT_KEY, {
    expiresIn: expireTime,
  });

export const verifyToken = (token) => {
  try {
    const result = jwt.verify(token, SECRET_JWT_KEY);
    return {
      success: true,
      message: result,
    };
  } catch (error) {
    return handleTokenError(error);
  }
};

export const handleTokenError = (error) => {
  const errorMessages = {
    TokenExpiredError: "Token has expired",
    JsonWebTokenError: "Token is not valid",
    NotBeforeError: "Token is not active",
  };

  return {
    success: false,
    message: errorMessages[error.name] || "Token verification failed",
  };
};
