import { client } from "../config/db.js";
const books = "books";

export const insertBook = async (bookData) =>
  await client.db(process.env.DATABASE).collection(books).insertOne(bookData);

export const findOneBook = async (filter) =>
  await client.db(process.env.DATABASE).collection(books).findOne(filter);

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
    .db(process.env.DATABASE)
    .collection("books")
    .aggregate(pipeline)
    .toArray();
};

export const updateBookById = async (bookId, updateQuery) =>
  await client
    .db(process.env.DATABASE)
    .collection(books)
    .updateOne({ bookId }, updateQuery);

export const deleteBook = async (bookId) =>
  await client.db(process.env.DATABASE).collection(books).deleteOne(bookId);
