import { client, DATABASE } from "../config/index.js";
const reviews = "reviews";
const books = "books";

export const insertReview = (reviewData) =>
  client.db(DATABASE).collection(reviews).insertOne(reviewData);

export const findOneReview = (filter) =>
  client.db(DATABASE).collection(reviews).findOne(filter);

export const findReviews = (filter, sortOrder, page, limit) =>
  client
    .db(DATABASE)
    .collection(reviews)
    .aggregate([
      { $match: filter },
      {
        $lookup: {
          from: "users",
          foreignField: "userId",
          localField: "userId",
          as: "UserDetails",
        },
      },
      { $unwind: { path: "$UserDetails" } },
      {
        $project: {
          _id: 0,
          review: 1,
          stars: 1,
          reviewId: 1,
          createdAt: 1,
          ReviewBy: {
            $concat: ["$UserDetails.firstName", " ", "$UserDetails.lastName"],
          },
        },
      },
      { $sort: { createdAt: sortOrder } },
      { $skip: (page - 1) * limit },
      { $limit: limit },
    ])
    .toArray();

export const updateReviewById = (reviewId, updateReviewData) =>
  client
    .db(DATABASE)
    .collection(reviews)
    .updateOne({ reviewId }, { $set: updateReviewData });

export const deleteReview = (reviewId) =>
  client.db(DATABASE).collection(reviews).deleteOne(reviewId);

export const deleteReviews = (bookId) =>
  client.db(DATABASE).collection(reviews).deleteMany(bookId);

export const updateBookAvgRating = async (bookId) => {
  const calculateAvgRating = await client
    .db(DATABASE)
    .collection("reviews")
    .aggregate([
      {
        $group: {
          _id: null,
          avgRating: { $avg: "$stars" },
        },
      },
      {
        $project: {
          _id: 0,
          avgRating: { $round: ["$avgRating", 2] },
        },
      },
    ])
    .toArray();

  // Get the average rating and count from aggregation result
  const avgRating =
    calculateAvgRating.length > 0 ? calculateAvgRating[0].avgRating : 0;

  const result = await client
    .db(DATABASE)
    .collection(books)
    .updateOne(bookId, {
      $set: { averageRating: avgRating },
      $inc: { bookReviewCount: 1 },
    });

  return result;
};
