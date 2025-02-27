import { client } from "../config/db.js";
const posts = "posts";

export const insertPost = async (post) =>
  await client.db(process.env.DATABASE).collection(posts).insertOne(post);

export const findPostById = async (postId) =>
  await client.db(process.env.DATABASE).collection(posts).findOne(postId);

export const deletePost = async (postId) =>
  await client.db(process.env.DATABASE).collection(posts).deleteOne(postId);

export const findPosts = async (filter, sortOrder) =>
  await client
    .db(process.env.DATABASE)
    .collection(posts)
    .find(filter)
    .sort({ createdAt: sortOrder })
    .toArray();
