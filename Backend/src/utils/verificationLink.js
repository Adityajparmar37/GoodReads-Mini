import { encrypt } from "./crypto.js";
import { generateToken } from "./token.js";
import { FRONTEND_URL } from "../config/index.js";

export const createVerificationLink = (userId) => {
  const token = generateToken({ id: userId }, "1d");
  const { iv, encryptedData } = encrypt(token);
  return `${FRONTEND_URL}api/v1/auth?token=${encryptedData}&init=${iv}`;
};
