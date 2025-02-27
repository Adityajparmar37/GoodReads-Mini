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

// @route   POST/api/v1/posts/
// @desc    publish post on specified social Media
export const postBook = handleAsync(async (ctx) => {
  const platforms = ctx.state.post?.platforms;
  const userId = ctx.state.user;
  const bookId = ctx.state.book;
  const timestamp = new Date();
  const bookDetails = await findOneBook(bookId);

  // run platform service by mapping its object
  const postResults = await Bluebird.mapSeries(platforms, async (platform) =>
    platformActionsToCreatePost[platform](ctx, bookDetails)
  );

  const successfullPosts = postResults.filter((post) => post.success);
  const failedMessage = postResults
    .filter((post) => !post.success)
    .map((failed) => `${failed.platform}, on ${failed.message}`);

  if (successfullPosts.length === 0) {
    sendResponse(ctx, 400, {
      response: {
        success: false,
        message: "Not posted, please try again",
      },
    });
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
        createdAt: timestamp,
      })
  );

  result.length > 0
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
});

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
// @desc
export const deleteBookPost = handleAsync(async (ctx) => {
  const sharedId = ctx.state.shared.shareId;
  const findPost = await findPostById(sharedId);

  if (!findPost)
    return {
      success: false,
      message: "Cannot find the post",
    };
  const postDeleteResult = await platformActionsToDeletePost[findPost.platform](
    ctx,
    findPost.postId
  );

  if (!postDeleteResult.success) {
    sendResponse(ctx, 200, {
      response: {
        success: true,
        message: `${postDeleteResult.message}, on ${postDeleteResult.platform}`,
      },
    });
    return;
  }

  const result = await deletePost(sharedId);

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
