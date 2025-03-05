import { client, DATABASE } from "../config/index.js";
const users = "users";

export const insertUser = (data) =>
  client.db(DATABASE).collection(users).insertOne(data);

export const findUser = (data) =>
  client.db(DATABASE).collection(users).findOne({ email: data });

export const findUserById = (userId) =>
  client.db(DATABASE).collection(users).findOne({ userId });

export const updateUser = (userId, updateQuery) =>
  client.db(DATABASE).collection(users).updateOne({ userId }, updateQuery);

export const incrementFollowerCount = (userId) =>
  client
    .db(DATABASE)
    .collection(users)
    .updateOne(userId, { $inc: { followerCount: 1 } });

export const incrementFollowingCount = (userId) =>
  client
    .db(DATABASE)
    .collection(users)
    .updateOne(userId, { $inc: { followingCount: 1 } });

export const decrementFollowerCount = (userId) =>
  client
    .db(DATABASE)
    .collection(users)
    .updateOne(userId, { $inc: { followerCount: -1 } });

export const decrementFollowingCount = (userId) =>
  client
    .db(DATABASE)
    .collection(users)
    .updateOne(userId, { $inc: { followingCount: -1 } });
