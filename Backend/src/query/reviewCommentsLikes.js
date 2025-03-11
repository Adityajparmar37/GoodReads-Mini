import { client, DATABASE } from "../config/index.js";
const reviewComments = "review_comments";
const reviewLikes = "review_likes";

export const insertReviewComment = (commentData) =>
  client.db(DATABASE).collection(reviewComments).insertOne(commentData);

export const updateReviewCommentById = (commentId, updateData) =>
  client
    .db(DATABASE)
    .collection(reviewComments)
    .updateOne(commentId, { $set: { comment: updateData } });

export const deleteReviewComment = (commentId) =>
  client.db(DATABASE).collection(reviewComments).deleteOne(commentId);

export const deleteReviewAllComments = (reviewId) =>
  client.db(DATABASE).collection(reviewComments).deleteMany(reviewId);

export const findCommentById = (commentId) =>
  client.db(DATABASE).collection(reviewComments).findOne(commentId);

export const findReviewComments = (reviewId, limit) =>
  client
    .db(DATABASE)
    .collection(reviewComments)
    .aggregate([
      {
        $match: reviewId,
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

export const insertReviewLike = (reviewLikeData) =>
  client.db(DATABASE).collection(reviewLikes).insertOne(reviewLikeData);

export const deleteReviewLike = (filter) =>
  client.db(DATABASE).collection(reviewLikes).deleteOne(filter);

export const deleteReviewAllLikes = (filter) =>
  client.db(DATABASE).collection(reviewLikes).deleteMany(filter);

export const findReviewLike = (reviewId) =>
  client
    .db(DATABASE)
    .collection(reviewLikes)
    .aggregate([
      {
        $match: { reviewId },
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
