import { client } from "../config/db.js";
const shelves = "shelves";
const shelf_books = "shelf_books";

//shelves's queries
export const insertShelf = async (shelveData) =>
  await client
    .db(process.env.DATABASE)
    .collection(shelves)
    .insertOne(shelveData);

export const deleteShelf = async (shelfId) =>
  await client.db(process.env.DATABASE).collection(shelves).deleteOne(shelfId);

export const findOneShelf = async (filter) =>
  await client.db(process.env.DATABASE).collection(shelves).findOne(filter);

export const findShevles = async (filter) =>
  await client
    .db(process.env.DATABASE)
    .collection(shelves)
    .find(filter)
    .toArray();

export const updateShelfById = async (shelfId, updateShelfData) =>
  await client
    .db(process.env.DATABASE)
    .collection(shelves)
    .updateOne(shelfId, { $set: updateShelfData });

// shelves 's book queries
export const insertBookToShelves = async (bookToShelvesData) =>
  await client
    .db(process.env.DATABASE)
    .collection(shelf_books)
    .insertMany(bookToShelvesData);

export const deleteBookFromShelf = async (filter) =>
  await client
    .db(process.env.DATABASE)
    .collection(shelf_books)
    .deleteMany(filter);

export const bookInShelf = async (filter) =>
  await client.db(process.env.DATABASE).collection(shelf_books).findOne(filter);

export const shelfBooks = async (shelfId) =>
  await client
    .db(process.env.DATABASE)
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
