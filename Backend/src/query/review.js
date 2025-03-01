import { client } from "../config/db.js";
const reviews = "reviews";
const books = "books";

export const insertReview = async (reviewData) =>
  await client
    .db(process.env.DATABASE)
    .collection(reviews)
    .insertOne(reviewData);

export const findOneReview = async (filter) =>
  await client.db(process.env.DATABASE).collection(reviews).findOne(filter);

export const findReviews = async (filter) =>
  await client
    .db(process.env.DATABASE)
    .collection(reviews)
    .find(filter)
    .toArray();

export const updateReviewById = async (reviewId, updateReviewData) =>
  await client
    .db(process.env.DATABASE)
    .collection(reviews)
    .updateOne({ reviewId }, { $set: updateReviewData });

export const deleteReview = async (reviewId) =>
  await client.db(process.env.DATABASE).collection(reviews).deleteOne(reviewId);

export const deleteReviews = async (bookId) =>
  await client.db(process.env.DATABASE).collection(reviews).deleteMany(bookId);

export const updateBookAvgRating = async (bookId) => {
  const calculateAvgRating = await client
    .db(process.env.DATABASE)
    .collection(reviews)
    .aggregate([
      { $group: { _id: "$bookId", avgRating: { $avg: "$stars" } } },
      { $project: { _id: 0, avgRating: { $round: ["$avgRating", 2] } } },
    ])
    .toArray();

  const avgRating =
    calculateAvgRating.length > 0 ? calculateAvgRating[0].avgRating : 0;

  const result = await client
    .db(process.env.DATABASE)
    .collection(books)
    .updateOne({ bookId }, { $set: { averageRating: avgRating } });

  return result;
};
