import { handleAsync } from "../middleware/handleAsync.js";
import { findOneBook } from "../query/books.js";
import {
  deletePost,
  findPostById,
  findPosts,
  insertPost,
} from "../query/post.js";
import { createId } from "../utils/createId.js";
import { sendResponse } from "../utils/sendResponse.js";
import Bluebird from "bluebird";
import {
  platformActionsToCreatePost,
  platformActionsToDeletePost,
} from "../utils/mapping.js";
import { timestamp } from "../utils/timestamp.js";
import { createPostJobs } from "../services/postServices.js";

// Environment variable to control async vs sync posting
const USE_ASYNC_POSTING = process.env.USE_ASYNC_POSTING === 'true';

// @route   POST/api/v1/posts/
// @desc    publish post on specified social Media
export const postBook = handleAsync(async (ctx) => {
  const platforms = ctx.state.post?.platforms;
  const userId = ctx.state.user;
  const bookId = ctx.state.book;
  const bookDetails = (await findOneBook(bookId)).at(0);

  const postData = {
    message: `📔 Title: ${bookDetails.title}\u000A\u000A 📃 About: ${bookDetails.description}\u000A\u000A\u000A ✒️ Author: ${bookDetails.author}\u000A\u000A\u000A ⭐ Rating: ${bookDetails.averageRating}`,
    url: bookDetails.coverImage,
  };

  // Check if async posting is enabled
  if (USE_ASYNC_POSTING) {
    // Use new async microservices architecture
    return await handleAsyncPosting(ctx, platforms, userId, bookId, postData, bookDetails);
  } else {
    // Use existing synchronous approach for backward compatibility
    return await handleSyncPosting(ctx, platforms, userId, bookId, postData, bookDetails);
  }
});

/**
 * Handles asynchronous posting using microservices
 */
const handleAsyncPosting = async (ctx, platforms, userId, bookId, postData, bookDetails) => {
  try {
    // Create jobs for each platform
    const jobsData = platforms.map(platform => ({
      userId,
      bookId: bookDetails.bookId,
      platform,
      postData,
    }));

    const result = await createPostJobs(jobsData);

    if (result.success && result.successfulJobs > 0) {
      sendResponse(ctx, 202, { // 202 Accepted for async processing
        response: {
          success: true,
          message: "Posts are being processed asynchronously",
          jobIds: result.jobIds,
          totalJobs: result.totalJobs,
          successfulJobs: result.successfulJobs,
          failedJobs: result.failedJobs,
        },
      });
    } else {
      sendResponse(ctx, 400, {
        response: {
          success: false,
          message: "Failed to create post jobs",
          errors: result.errors,
        },
      });
    }
  } catch (error) {
    console.error('Async posting error:', error);
    sendResponse(ctx, 500, {
      response: {
        success: false,
        message: "Internal server error during async posting",
        error: error.message,
      },
    });
  }
};

/**
 * Handles synchronous posting (original implementation)
 */
const handleSyncPosting = async (ctx, platforms, userId, bookId, postData, bookDetails) => {
  // run platform service by mapping its object
  const postResults = await Bluebird.mapSeries(platforms, async (platform) =>
    platformActionsToCreatePost[platform](ctx, postData)
  );

  const successfullPosts = postResults.filter((post) => post.success);
  const failedMessage = postResults
    .filter((post) => !post.success)
    .map((failed) => `${failed.platform}, ${failed.message}`);

  if (successfullPosts.length === 0) {
    sendResponse(ctx, 400, {
      response: {
        success: false,
        message: "Not posted, please try again",
      },
    });
    return;
  }

  const result = await Bluebird.map(
    successfullPosts,
    async (post) =>
      await insertPost({
        sharedId: createId(),
        userId,
        postId: post.postId,
        platform: post.platform,
        bookId: bookDetails.bookId,
        createdAt: timestamp(),
      })
  );

  result.length > 0 && failedMessage.length === 0
    ? sendResponse(ctx, 200, {
        response: {
          success: true,
          messages: "Post successfully",
        },
      })
    : sendResponse(ctx, 400, {
        response: {
          success: false,
          failedMessage,
        },
      });
};

// @route   GET/api/v1/posts/
// @desc    delete post on specified social Media
export const getPosts = handleAsync(async (ctx) => {
  const userId = ctx.state.user;
  const { sortOrder, platform } = ctx?.state?.shared;
  const result = await findPosts(
    platform ? { userId, platform } : { userId },
    sortOrder
  );

  result.length > 0
    ? sendResponse(ctx, 200, {
        response: {
          success: true,
          data: result,
        },
      })
    : sendResponse(ctx, 400, {
        response: {
          success: false,
          message: "No Posts Found",
        },
      });
});

// @route   DELETE/api/v1/posts/
// @desc    delete the post
export const deleteBookPost = handleAsync(async (ctx) => {
  const sharedId = ctx.state.shared?.sharedId;
  const findPost = await findPostById({ sharedId });

  if (!findPost)
    return {
      success: false,
      message: "Cannot find the post",
    };

  //get delete service of social platform
  const postDeleteResult = await platformActionsToDeletePost[findPost.platform](
    ctx,
    findPost.postId
  );

  if (!postDeleteResult?.success) {
    sendResponse(ctx, 400, {
      response: {
        success: false,
        message: `${postDeleteResult.message}, on ${postDeleteResult.platform}`,
      },
    });
    return;
  }

  const result = await deletePost({ sharedId });

  result.deletedCount > 0
    ? sendResponse(ctx, 200, {
        response: {
          success: true,
          message: "Post Deleted successfully from facebook",
        },
      })
    : sendResponse(ctx, 200, {
        response: {
          success: true,
          message: "Post not delted from facebook, please try again",
        },
      });
});
