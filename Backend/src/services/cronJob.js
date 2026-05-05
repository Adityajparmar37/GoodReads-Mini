import { findPendingPosts, updatePostStatus } from "../query/queuedPost.js";
import { sendMessage } from "./awsSQSServices.js";
import Bluebird from "bluebird";

// Cron job to process pending posts and send to SQS
export const processPendingPosts = async () => {
  try {
    console.log("Cron job started: Processing pending posts...");

    const pendingPosts = await findPendingPosts(10);

    if (pendingPosts.length === 0) {
      console.log("No pending posts found");
      return;
    }

    // Process all posts in parallel
    await Bluebird.map(
      pendingPosts,
      async (post) => {
        try {
          // Mark as processing
          await updatePostStatus(post.queuedPostId, "processing");

          // Send all platforms for this post in parallel
          await Bluebird.map(post.platforms, async (platform) => {
            const messageBody = {
              queuedPostId: post.queuedPostId,
              userId: post.userId,
              bookId: post.bookId,
              platform,
              postData: post.postData,
            };

            await sendMessage(messageBody, platform);
            console.log(`Sent to SQS: ${post.queuedPostId} for platform ${platform}`);
          });
        } catch (error) {
          console.error(`Error processing post ${post.queuedPostId}:`, error);
          await updatePostStatus(post.queuedPostId, "failed", {
            error: error.message,
          });
        }
      },
      { concurrency: 5 } // Process 5 posts concurrently
    );

    console.log("Cron job completed");
  } catch (error) {
    console.error("Cron job error:", error);
  }
};
