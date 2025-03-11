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
    .aggregate([
      {
        $match: { followeeId: userId },
      },
      {
        $lookup: {
          from: "users",
          localField: "followingId",
          foreignField: "userId",
          as: "followingUser",
        },
      },
      {
        $unwind: "$followingUser",
      },
      {
        $project: {
          _id: 0,
          userName: {
            $concat: ["$followerUser.firstName", " ", "$followerUser.lastName"],
          },
        },
      },
      {
        $sort: { createdAt: sortOrder },
      },
      {
        $skip: (page - 1) * limit,
      },
      {
        $limit: limit,
      },
    ])
    .toArray();

export const findFollowers = (userId, sortOrder, page, limit) =>
  client
    .db(DATABASE)
    .collection(follow)
    .aggregate([
      {
        $match: { followingId: userId },
      },
      {
        $lookup: {
          from: "users",
          localField: "followeeId",
          foreignField: "userId",
          as: "followerUser",
        },
      },
      {
        $unwind: "$followerUser",
      },
      {
        $project: {
          _id: 0,
          userName: {
            $concat: ["$followerUser.firstName", " ", "$followerUser.lastName"],
          },
        },
      },
      {
        $sort: { createdAt: sortOrder },
      },
      {
        $skip: (page - 1) * limit,
      },
      {
        $limit: limit,
      },
    ])
    .toArray();
