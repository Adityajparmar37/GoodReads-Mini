import { sortMapping } from "../utils/mapping.js";
import { isValidPageLimit } from "../shared/index.js";
import { findUserById } from "../query/auth.js";

export const isBodyEmpty = (ctx) => {
  if (!ctx.request.body || Object.keys(ctx.request.body).length === 0) {
    ctx.throw(400, "Please provide data");
  }
};

export const validateSortOrder = (ctx) => {
  const sort = ctx.query.sort;

  if (sort && !["AESC", "DESC"].includes(ctx.query.sort))
    return {
      field: "sort",
      message: "Sort must be either 'AESC' or 'DESC' ",
    };

  const sortOrder = sort ? sortMapping[sort] : 1;

  ctx.state.shared = {
    ...ctx.state.shared,
    ...(sortOrder ? { sortOrder } : {}),
  };
};

export const validatepage = (ctx) => {
  const { page, limit } = ctx.query;

  if (page) {
    if (!isValidPageLimit(page)) {
      return {
        field: "page",
        message: "Page must be a positive number",
      };
    }
  }

  if (limit) {
    if (!isValidPageLimit(limit)) {
      return {
        field: "limit",
        message: "Limit must be a positive number",
      };
    }
  }

  ctx.state.shared = {
    ...ctx.state.shared,
    ...(page ? { page: parseInt(page, 10) } : { page: 1 }),
    ...(limit ? { limit: parseInt(limit, 10) } : { limit: 10 }),
  };
};

export const validateSearchTerm = (ctx) => {
  const searchTerm = ctx.query.search;
  if (searchTerm && typeof searchTerm !== "string")
    return {
      field: "search",
      message: "Please provide valid search term",
    };

  ctx.state.shared = {
    ...ctx.state.shared,
    ...(searchTerm ? { searchTerm } : {}),
  };
};

export const IsUserExist = async (ctx) => {
  const userId = ctx.state.user 
  if (userId) {
    const userExist = await findUserById(userId);
    if (!userExist)
      return {
        field: "user",
        message: "User does not exist",
      };
  }
};
