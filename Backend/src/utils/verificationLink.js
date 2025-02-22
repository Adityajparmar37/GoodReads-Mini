import { encrypt } from "./crypto.js";
import { generateToken } from "./token.js";

export const createVerificationLink = (userId) => {
  const token = generateToken({ id: userId }, "1d");
  const { iv, encryptedData } = encrypt(token);
  return `${process.env.URL}api/v1/auth?token=${encryptedData}&init=${iv}`;
};
