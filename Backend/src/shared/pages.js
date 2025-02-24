export const isValidPageLimit = (pageLimit) => {
  pageLimit = parseInt(pageLimit, 10);
  if (isNaN(pageLimit) || pageLimit < 1) return false;
  return true;
};
