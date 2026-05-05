import { client, DATABASE } from "../config/index.js";
const queuedPosts = "queuedPosts";

export const insertQueuedPost = (post) =>
  client.db(DATABASE).collection(queuedPosts).insertOne(post);

export const findPendingPosts = (limit = 10) =>
  client
    .db(DATABASE)
    .collection(queuedPosts)
    .find({ status: "pending" })
    .limit(limit)
    .toArray();

export const updatePostStatus = (postId, status, metadata = {}) =>
  client
    .db(DATABASE)
    .collection(queuedPosts)
    .updateOne(
      { queuedPostId: postId },
      {
        $set: {
          status,
          ...metadata,
          updatedAt: new Date(),
        },
      }
    );

export const findQueuedPostById = (queuedPostId) =>
  client.db(DATABASE).collection(queuedPosts).findOne({ queuedPostId });
