import { client } from "../config/db.js";
const users = "users";

export const insertUser = async (data) =>
  await client.db(process.env.DATABASE).collection(users).insertOne(data);

export const findUser = async (data) =>
  await client
    .db(process.env.DATABASE)
    .collection(users)
    .findOne({ email: data });

export const findUserById = async (userId) =>
  await client.db(process.env.DATABASE).collection(users).findOne({ userId });

export const updateUser = async (userId, updateQuery) =>
  await client
    .db(process.env.DATABASE)
    .collection(users)
    .updateOne({ userId }, updateQuery);
