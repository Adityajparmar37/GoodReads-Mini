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

  const sortOrder = sort ? sortMapping.get(sort) : 1;

  ctx.state.shared = {
    ...ctx.state.shared,
    ...(sortOrder ? { sortOrder } : {}),
  };
};
