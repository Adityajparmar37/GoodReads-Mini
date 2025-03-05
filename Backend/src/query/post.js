import { client, DATABASE } from "../config/index.js";
const posts = "posts";

export const insertPost = (post) =>
  client.db(DATABASE).collection(posts).insertOne(post);

export const findPostById = (postId) =>
  client.db(DATABASE).collection(posts).findOne(postId);

export const deletePost = (postId) =>
  client.db(DATABASE).collection(posts).deleteOne(postId);

export const findPosts = (filter, sortOrder) =>
  client
    .db(DATABASE)
    .collection(posts)
    .find(filter)
    .sort({ createdAt: sortOrder })
    .toArray();
