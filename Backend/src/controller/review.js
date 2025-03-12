import Bluebird from "bluebird";
import { handleAsync } from "../middleware/handleAsync.js";
import { decrementBookReviewCount, findOneBook } from "../query/books.js";
import {
  deleteReviewAllComments,
  deleteReviewAllLikes,
} from "../query/reviewCommentsLikes.js";
import {
  deleteReview,
  findReviews,
  insertReview,
  updateBookAvgRating,
  updateReviewById,
} from "../query/review.js";
import { createId } from "../utils/createId.js";
import { sendResponse } from "../utils/sendResponse.js";
import { timestamp } from "../utils/timestamp.js";
import { createUserInput } from "../utils/promptWrapper.js";
import { geminiService } from "../services/geminiAI.js";

// @route   POST/api/v1/reviews/
// @desc    add review
export const addReview = handleAsync(async (ctx) => {
  const reviewData = ctx.state.reviews;
  const { bookId } = ctx.state.book;
  const userId = ctx.state.user;

  const resultInsertingRerview = await insertReview({
    ...reviewData,
    reviewId: createId(),
    bookId,
    userId,
    stars: reviewData.stars ?? 0,
    createdAt: timestamp(),
    updateAt: timestamp(),
  });

  if (!resultInsertingRerview.acknowledged) {
    sendResponse(ctx, 400, {
      response: {
        success: false,
        message: "Review not added, please try again",
      },
    });
    return;
  }
  const ratingResult = await updateBookAvgRating({ bookId });

  ratingResult.acknowledged
    ? sendResponse(ctx, 200, {
        response: {
          success: true,
          message: "Thank you for your review",
        },
      })
    : sendResponse(ctx, 400, {
        response: {
          success: false,
          message: "Review not added, please try again",
        },
      });
});

// @route   GET/api/v1/reviews/bookID
// @desc    get reviews
export const getReviews = handleAsync(async (ctx) => {
  const bookId = ctx.state.book;
  const userId = ctx.state.user;

  const result = await findReviews(bookId ? bookId : { userId });

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
          message: "No reviews found",
        },
      });
});

// @route   POST/api/v1/reviews/
// @desc    update review
export const updateReview = handleAsync(async (ctx) => {
  const { reviewId, ...reviewUpdateData } = ctx.state.reviews;
  const result = await updateReviewById(reviewId, {
    ...reviewUpdateData,
    updateAt: timestamp(),
  });

  if (!result.acknowledged) {
    sendResponse(ctx, 400, {
      response: {
        succuess: false,
        message: "Review not updated please try again",
      },
    });
    return;
  }

  result.modifiedCount > 0
    ? sendResponse(ctx, 200, {
        response: {
          success: true,
          message: "Review updated successfully",
        },
      })
    : sendResponse(ctx, 200, {
        response: {
          success: false,
          message: "Review remains same",
        },
      });
});

// @route   DELETE/api/v1/reviews/
// @desc    delete review
export const removeReview = handleAsync(async (ctx) => {
  const reviewId = ctx.state.reviews?.reviewId;
  const bookId = ctx.state?.book?.bookId;

  const deleteOperations = [
    () => deleteReview({ reviewId }),
    () => decrementBookReviewCount({ bookId }),
    () => deleteReviewAllComments({ reviewId }),
    () => deleteReviewAllLikes(reviewId),
  ];

  const results = await Bluebird.mapSeries(deleteOperations, (queries) =>
    queries()
  );

  const [
    resultReviewRemove,
    resultDecrementBookReviewCount,
    resultReviewAllComments,
  ] = results;

  if (
    !resultReviewRemove.acknowledged ||
    !resultDecrementBookReviewCount.acknowledged ||
    !resultReviewAllComments.acknowledged
  ) {
    sendResponse(ctx, 400, {
      response: {
        success: false,
        message: "Review not delete, please try again",
      },
    });
    return;
  }

  resultReviewRemove.deletedCount > 0 &&
  resultDecrementBookReviewCount.modifiedCount > 0
    ? sendResponse(ctx, 200, {
        response: {
          success: true,
          message: "Review deleted",
        },
      })
    : sendResponse(ctx, 200, {
        response: {
          success: false,
          message: "Review already remove",
        },
      });
});

// @route   POST/api/v1/reviews/generate
// @desc    generate AI review
export const generateReview = handleAsync(async (ctx) => {
  const bookId = ctx.state?.book?.bookId;
  const userPrompt = ctx.state.shared?.prompt ?? "";
  const { title, description, author, genres } = await findOneBook({ bookId });
  
  // Reformat the prompt based on specified requirements
  const inputPrompt = createUserInput(
    userPrompt,
    title,
    description,
    author,
    genres
  );
  const generatedReviewResult = await geminiService(inputPrompt);

  console.log(generatedReviewResult);

  generatedReviewResult
    ? sendResponse(ctx, 200, {
        success: true,
        response: {
          data: generatedReviewResult,
        },
      })
    : sendResponse(ctx, 400, {
        success: false,
        response: {
          message: "Review not generated, please try again",
        },
      });
});
