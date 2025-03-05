import { client, DATABASE } from "../config/index.js";
const shelves = "shelves";
const shelf_books = "shelf_books";

//shelves's queries
export const insertShelf = (shelveData) =>
  client.db(DATABASE).collection(shelves).insertOne(shelveData);

export const deleteShelf = (shelfId) =>
  client.db(DATABASE).collection(shelves).deleteOne(shelfId);

export const findOneShelf = (filter) =>
  client.db(DATABASE).collection(shelves).findOne(filter);

export const findShevles = (query, sortOrder, page, limit) =>
  client
    .db(DATABASE)
    .collection(shelves)
    .find(query)
    .sort({ createdAt: sortOrder })
    .skip((page - 1) * limit)
    .limit(limit)
    .toArray();

export const updateShelfById = (shelfId, updateShelfData) =>
  client
    .db(DATABASE)
    .collection(shelves)
    .updateOne(shelfId, { $set: updateShelfData });

// shelves 's book queries
export const insertBookToShelves = (bookToShelvesData) =>
  client.db(DATABASE).collection(shelf_books).insertMany(bookToShelvesData);

export const deleteBookFromShelf = (filter) =>
  client.db(DATABASE).collection(shelf_books).deleteMany(filter);

export const bookInShelf = (filter) =>
  client.db(DATABASE).collection(shelf_books).findOne(filter);

export const shelfBooks = (shelfId) =>
  client
    .db(DATABASE)
    .collection(shelf_books)
    .aggregate([
      {
        $match: { shelfId },
      },
      {
        $lookup: {
          from: "books",
          foreignField: "bookId",
          localField: "bookId",
          as: "BookDetails",
        },
      },
      { $unwind: "$BookDetails" },
      {
        $project: {
          title: "$BookDetails.title",
          description: "$BookDetails.description",
          averageRating: "$BookDetails.averageRating",
          author: "$BookDetails.author",
          _id: 0,
        },
      },
    ])
    .toArray();
