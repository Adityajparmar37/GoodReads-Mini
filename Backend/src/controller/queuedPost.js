import { handleAsync } from "../middleware/handleAsync.js";
import { findOneBook } from "../query/books.js";
import { insertQueuedPost } from "../query/queuedPost.js";
import { createId } from "../utils/createId.js";
import { sendResponse } from "../utils/sendResponse.js";
import { timestamp } from "../utils/timestamp.js";

// @route   POST/api/v1/queued-posts/
// @desc    Queue post for later publishing to social media
export const queuePost = handleAsync(async (ctx) => {
  const platforms = ctx.state.post?.platforms;
  const userId = ctx.state.user;
  const bookId = ctx.state.book;
  const bookDetails = (await findOneBook(bookId)).at(0);

  const postData = {
    message: `📔 Title: ${bookDetails.title}\u000A\u000A 📃 About: ${bookDetails.description}\u000A\u000A\u000A ✒️ Author: ${bookDetails.author}\u000A\u000A\u000A ⭐ Rating: ${bookDetails.averageRating}`,
    url: bookDetails.coverImage,
  };

  const queuedPost = {
    queuedPostId: createId(),
    userId,
    bookId: bookDetails.bookId,
    platforms,
    postData,
    status: "pending", // pending, processing, completed, failed
    createdAt: timestamp(),
    updatedAt: timestamp(),
  };

  const result = await insertQueuedPost(queuedPost);

  result.insertedId
    ? sendResponse(ctx, 200, {
        response: {
          success: true,
          message: "Post queued successfully",
          queuedPostId: queuedPost.queuedPostId,
        },
      })
    : sendResponse(ctx, 400, {
        response: {
          success: false,
          message: "Failed to queue post",
        },
      });
});
