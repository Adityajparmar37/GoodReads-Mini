import { client, DATABASE } from "../config/index.js";
const books = "books";

export const insertBook = (bookData) =>
  client.db(DATABASE).collection(books).insertOne(bookData);

export const findOneBook = (filter) =>
  client
    .db(DATABASE)
    .collection(books)
    .aggregate([
      { $match: filter },
      {
        $lookup: {
          from: "users",
          foreignField: "userId",
          localField: "publishedBy",
          as: "publishedDetails",
        },
      },
      { $unwind: { path: "$publishedDetails" } },
      {
        $project: {
          _id: 0,
          title: 1,
          description: 1,
          averageRating: 1,
          bookReviewCount: 1,
          bookId: 1,
          author: 1,
          genres: 1,
          createdAt: 1,
          coverImage:1,
          publishedBy: 1,
          publisher: {
            $concat: [
              "$publishedDetails.firstName",
              " ",
              "$publishedDetails.lastName",
            ],
          },
          publisherEmail: "$publishedDetails.email",
        },
      },
    ])
    .toArray();

export const findBooks = async (searchTerm, sortOrder, page, limit) => {
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
    {
      $project: {
        _id: 1,
        title: 1,
        description: 1,
        bookId: 1,
        author: 1,
        genres: 1,
        createdAt: 1,
        publishedBy: {
          $concat: [
            "$publishedDetails.firstName",
            " ",
            "$publishedDetails.lastName",
          ],
        },
        publisherEmail: "$publishedDetails.email",
      },
    },
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

//vector search query for similar book genres
export const findSimilarGenresBooks = (searchQueryEmbedded) =>
  client
    .db(DATABASE)
    .collection(books)
    .aggregate([
      {
        $vectorSearch: {
          queryVector: searchQueryEmbedded,
          path: "description_genres_embedding",
          numCandidates: 100,
          limit: 10,
          index: "descriptionGenresIndex",
        },
      },
      {
        $set: {
          score: { $meta: "vectorSearchScore" },
        },
      },
      {
        $match: {
          score: { $gte: 0.65 }, //similarity threshold
        },
      },
      {
        $project: {
          genres_embedding: 0,
        },
      },

      {
        $project: {
          _id: 0,
          score: 1,
          title: 1,
          author: 1,
          genres: 1,
          description: 1,
        },
      },
    ])
    .toArray();
