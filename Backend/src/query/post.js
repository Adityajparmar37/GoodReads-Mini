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

// New functions for job tracking
export const insertPostJob = (job) =>
  client.db(DATABASE).collection(posts).insertOne(job);

export const updatePostJobStatus = (jobId, status, errorMessage = null) =>
  client.db(DATABASE).collection(posts).updateOne(
    { jobId },
    {
      $set: {
        jobStatus: status,
        updatedAt: new Date(),
        ...(errorMessage && { errorMessage }),
        ...(status === 'completed' && { completedAt: new Date() }),
      },
      $inc: { retryCount: status === 'failed' ? 1 : 0 },
    }
  );

export const findPostJobById = (jobId) =>
  client.db(DATABASE).collection(posts).findOne({ jobId });

export const findPendingJobs = () =>
  client.db(DATABASE).collection(posts).find({ jobStatus: 'pending' }).toArray();

export const findJobsForRetry = (maxRetryCount) =>
  client.db(DATABASE).collection(posts).find({
    jobStatus: 'failed',
    retryCount: { $lt: maxRetryCount }
  }).toArray();

export const updatePostWithJobResult = (jobId, postId, platform) =>
  client.db(DATABASE).collection(posts).updateOne(
    { jobId },
    {
      $set: {
        postId,
        platform,
        jobStatus: 'completed',
        completedAt: new Date(),
        updatedAt: new Date(),
      }
    }
  );
