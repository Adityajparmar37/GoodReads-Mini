import { registerUser, loginUser, verifyUser } from "./auth.js";
import {
  createBook,
  removeBook,
  updateBook,
  getBooks,
  getBook,
} from "./books.js";
import { addReview, removeReview, updateReview, getReviews } from "./review.js";
import { postBook, deleteBookPost, getPosts } from "./post.js";

export {
  registerUser,
  loginUser,
  verifyUser,
  createBook,
  removeBook,
  updateBook,
  getBooks,
  getBook,
  addReview,
  getReviews,
  removeReview,
  updateReview,
  postBook,
  deleteBookPost,
  getPosts,
};
