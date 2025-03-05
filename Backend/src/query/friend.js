import { client, DATABASE } from "../config/index.js";
const friend = "friend";

export const insertFriend = (friendData) =>
  client.db(DATABASE).collection(friend).insertOne(friendData);

export const findFriends = (filter, sortOrder, page, limit) =>
  client
    .db(DATABASE)
    .collection(friend)
    .find(filter, {
      projection: { _id: 0, userId: 0, createdAt: 0, updatedAt: 0, status: 0 },
    })
    .sort({ createdAt: sortOrder })
    .skip((page - 1) * limit)
    .limit(limit)
    .toArray();

export const getFriendList = (userId, sortOrder, page, limit) =>
  client
    .db(DATABASE)
    .collection(friend)
    .aggregate([
      {
        $match: {
          $or: [{ friendId: userId }, { userId }],
          status: 1,
        },
      },
      {
        $lookup: {
          from: "users",
          let: {
            friendRef: {
              $cond: [{ $eq: ["$userId", userId] }, "$friendId", "$userId"],
            },
          },
          pipeline: [
            {
              $match: {
                $expr: { $eq: ["$userId", "$$friendRef"] },
              },
            },
            {
              $project: {
                _id: 0,
                fullName: { $concat: ["$firstName", " ", "$lastName"] },
              },
            },
          ],
          as: "friendDetails",
        },
      },
      {
        $unwind: "$friendDetails",
      },
      {
        $project: { _id: 0, fullName: "$friendDetails.fullName", createdAt: 1 },
      },
      { $sort: { createdAt: sortOrder } },
      { $skip: (page - 1) * limit },
      { $limit: limit },
    ])
    .toArray();

export const findPendingFriends = (filter, sortOrder, page, limit) =>
  client
    .db(DATABASE)
    .collection(friend)
    .aggregate([
      {
        $match: filter,
      },
      {
        $lookup: {
          from: "users",
          foreignField: "userId",
          localField: "userId",
          as: "FriendRequests",
        },
      },
      { $unwind: "$FriendRequests" },
      {
        $project: {
          _id: 0,
          createdAt: 1,
          FriendsName: {
            $concat: [
              "$FriendRequests.firstName",
              " ",
              "$FriendRequests.lastName",
            ],
          },
        },
      },
      { $sort: { createdAt: sortOrder } },
      { $skip: (page - 1) * limit },
      { $limit: limit },
    ])
    .toArray();

export const updateFriend = (query) =>
  client
    .db(DATABASE)
    .collection(friend)
    .updateOne(query, { $set: { status: 1 } });

export const findOneFriend = (filter) =>
  client.db(DATABASE).collection(friend).findOne(filter);

export const deleteFriend = (filter) =>
  client.db(DATABASE).collection(friend).deleteOne(filter);
