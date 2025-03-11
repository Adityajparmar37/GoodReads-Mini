import { client, DATABASE } from "../config/index.js";
const books = "books";

export const insertBook = (bookData) =>
  client.db(DATABASE).collection(books).insertOne(bookData);

export const findOneBook = (filter) =>
  client.db(DATABASE).collection(books).findOne(filter);

export const findBooks = async (
  searchTerm,
  sortOrder,
  page = 1,
  limit = 10
) => {
  const pipeline = [];

  if (searchTerm) {
    pipeline.push({
      $search: {
        index: "default",
        compound: {
          should: [
            {
              text: {
                query: searchTerm,
                path: ["title", "description", "author"],
              },
            },
          ],
        },
      },
    });
  }

  pipeline.push(
    {
      $lookup: {
        from: "users",
        foreignField: "userId",
        localField: "publishedBy",
        as: "publishedDetails",
      },
    },
    { $unwind: { path: "$publishedDetails" } },
    { $sort: { createdAt: sortOrder } },
    { $skip: (page - 1) * limit },
    { $limit: limit }
  );

  return await client
    .db(DATABASE)
    .collection(books)
    .aggregate(pipeline)
    .toArray();
};

export const updateBookById = (bookId, updateQuery) =>
  client.db(DATABASE).collection(books).updateOne({ bookId }, updateQuery);

export const deleteBook = (bookId) =>
  client.db(DATABASE).collection(books).deleteOne(bookId);

export const incrementBookReviewCount = (bookId) =>
  client
    .db(DATABASE)
    .collection(books)
    .updateOne(bookId, { $inc: { bookReviewCount: 1 } });

export const decrementBookReviewCount = (bookId) =>
  client
    .db(DATABASE)
    .collection(books)
    .updateOne(bookId, { $inc: { bookReviewCount: -1 } });
