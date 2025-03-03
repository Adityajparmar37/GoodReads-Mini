import { client } from "../config/db.js";
const follow = "follow";

export const findFollower = async (filter) => {
  return await client
    .db(process.env.DATABASE)
    .collection(follow)
    .findOne(filter);
};

export const insertFollower = async (followData) =>
  await client
    .db(process.env.DATABASE)
    .collection(follow)
    .insertOne(followData);

export const removeFollower = async (filter) =>
  await client.db(process.env.DATABASE).collection(follow).deleteOne(filter);

export const updateFollower = async (filter, updateQuery) =>
  await client
    .db(process.env.DATABASE)
    .collection(follow)
    .updateOne(filter, updateQuery);

export const findFollowing = async (userId, sortOrder, page, limit) =>
  await client
    .db(process.env.DATABASE)
    .collection("follow")
    .aggregate([
      {
        $match: { followeeId: userId },
      },
      {
        $lookup: {
          from: "users",
          localField: "followingId",
          foreignField: "userId",
          as: "followers",
        },
      },
      {
        $unwind: "$followers",
      },
      {
        $project: {
          _id: 0,
          fullName: {
            $concat: ["$followers.firstName", " ", "$followers.lastName"],
          },
        },
      },
      { $sort: { createdAt: sortOrder } },
      { $skip: (page - 1) * limit },
      { $limit: limit },
    ])
    .toArray();

export const findFollowers = async (userId, sortOrder, page, limit) =>
  await client
    .db(process.env.DATABASE)
    .collection("follow")
    .aggregate([
      {
        $match: { followingId: userId },
      },
      {
        $lookup: {
          from: "users",
          localField: "followeeId",
          foreignField: "userId",
          as: "followers",
        },
      },
      {
        $unwind: "$followers",
      },
      {
        $project: {
          _id: 0,
          fullName: {
            $concat: ["$followers.firstName", " ", "$followers.lastName"],
          },
        },
      },
      { $sort: { createdAt: sortOrder } },
      { $skip: (page - 1) * limit },
      { $limit: limit },
    ])
    .toArray();
