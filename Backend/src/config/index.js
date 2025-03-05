import { connectDb, client } from "./db.js";
import {
  FACEBOOK_BASE_URL,
  FACEBOOK_PAGE_ACCESS_TOKEN,
  FACEBOOK_PAGE_ID,
} from "./facebook.js";
import { INSTAGRAM_BASE_URL, INSTAGRAM_ID } from "./instagram.js";
import { ENCRYPTION_ALGORITHM, ENCRYPT_KEY, SECRET_JWT_KEY } from "./jwt.js";
import { EMAIL, MAILPASS } from "./mail.js";
import { DATABASE, FRONTEND_URL, PORT } from "./server.js";
import { MONGO_URL } from "./mongoDb.js";

export {
  MONGO_URL,
  connectDb,
  client,
  FACEBOOK_BASE_URL,
  FACEBOOK_PAGE_ACCESS_TOKEN,
  FACEBOOK_PAGE_ID,
  INSTAGRAM_BASE_URL,
  INSTAGRAM_ID,
  ENCRYPTION_ALGORITHM,
  ENCRYPT_KEY,
  SECRET_JWT_KEY,
  EMAIL,
  MAILPASS,
  DATABASE,
  FRONTEND_URL,
  PORT,
};
