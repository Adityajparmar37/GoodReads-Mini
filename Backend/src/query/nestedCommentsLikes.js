import { client, DATABASE } from "../config/index.js";
const nestedComments = "nested_comments";
const nestedCommentLikes = "nested_comments_likes";

export const insertNestedComment = (nestedCommentData) =>
  client.db(DATABASE).collection(nestedComments).insertOne(nestedCommentData);

export const updateNestedCommentById = (nestedCommentId, updateData) =>
  client
    .db(DATABASE)
    .collection(nestedComments)
    .updateOne(nestedCommentId, { $set: { comment: updateData } });

export const deleteNestedComment = (nestedCommentId) =>
  client.db(DATABASE).collection(nestedComments).deleteOne(nestedCommentId);

export const deleteAllNestedComments = (commentId) =>
  client.db(DATABASE).collection(nestedComments).deleteMany(commentId);

export const findNestedCommentById = (nestedCommentId) =>
  client.db(DATABASE).collection(nestedComments).findOne(nestedCommentId);

export const findNestedComments = (mainCommentId, limit) =>
  client
    .db(DATABASE)
    .collection(nestedComments)
    .aggregate([
      {
        $match: mainCommentId,
      },
      {
        $lookup: {
          from: "users",
          foreignField: "userId",
          localField: "userId",
          as: "userDetails",
        },
      },
      { $unwind: "$userDetails" },
      {
        $project: {
          _id: 0,
          createdAt: 1,
          comment: 1,
          userName: {
            $concat: ["$userDetails.firstName", " ", "$userDetails.lastName"],
          },
        },
      },
      {
        $sort: { createdAt: -1 },
      },
      {
        $limit: limit,
      },
    ])
    .toArray();

export const insertCommentLike = (commentLikeData) =>
  client.db(DATABASE).collection(nestedCommentLikes).insertOne(commentLikeData);

export const deleteCommentLike = (filter) =>
  client.db(DATABASE).collection(nestedCommentLikes).deleteOne(filter);

export const deleteCommentAllLikes = (filter) =>
  client.db(DATABASE).collection(nestedCommentLikes).deleteMany(filter);

export const findCommentLike = (commentId) =>
  client
    .db(DATABASE)
    .collection(nestedCommentLikes)
    .aggregate([
      {
        $match: { commentId },
      },
      {
        $lookup: {
          from: "users",
          foreignField: "userId",
          localField: "userId",
          as: "userDetails",
        },
      },
      { $unwind: "$userDetails" },
      {
        $project: {
          _id: 0,
          createdAt: 1,
          comment: 1,
          userName: {
            $concat: ["$userDetails.firstName", " ", "$userDetails.lastName"],
          },
        },
      },
      {
        $sort: { createdAt: -1 },
      },
    ])
    .toArray();
