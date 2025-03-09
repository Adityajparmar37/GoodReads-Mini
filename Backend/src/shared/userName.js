export const isUserNameValid = (name) => {
  const nameRegex = /^[A-Za-z ]+$/;
  if (name.trim().length === 0) return false;
  if (!nameRegex.test(name)) return false;
  return true;
};
