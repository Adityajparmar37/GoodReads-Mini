import { client, DATABASE } from "../config/index.js";
const follow = "follow";

export const findFollower = (filter) =>
  client.db(DATABASE).collection(follow).findOne(filter);

export const insertFollower = (followData) =>
  client.db(DATABASE).collection(follow).insertOne(followData);

export const removeFollower = (filter) =>
  client.db(DATABASE).collection(follow).deleteOne(filter);

export const updateFollower = (filter, updateQuery) =>
  client.db(DATABASE).collection(follow).updateOne(filter, updateQuery);

export const findFollowing = (userId, sortOrder, page, limit) =>
  client
    .db(DATABASE)
    .collection(follow)
    .find({ followeeId: userId }, { projection: { userName: 1, _id: 0 } })
    .sort({ createdAt: sortOrder })
    .skip((page - 1) * limit)
    .limit(limit)
    .toArray();

export const findFollowers = (userId, sortOrder, page, limit) =>
  client
    .db(DATABASE)
    .collection(follow)
    .find({ followingId: userId }, { projection: { userName: 1, _id: 0 } })
    .sort({ createdAt: sortOrder })
    .skip((page - 1) * limit)
    .limit(limit)
    .toArray();
