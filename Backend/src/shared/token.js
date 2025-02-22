import { decrypt } from "../utils/crypto.js";
import { verifyToken } from "../utils/token.js";

export const isValidToken = (token, iv) => {
  const result = decrypt({ encryptedData: token, iv });
  if (!result.success) return result;
  const checkToken = verifyToken(result.decryptedData);
  return checkToken;
};
