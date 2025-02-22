export const isEmailValid = (email) => {
  const emailRegex = /^[\w\.-]+@[a-zA-Z\d\.-]+\.[a-zA-Z]{2,6}$/;
  if (email.trim().length === 0) return false;
  if (!emailRegex.test(email) || email.length >= 50) return false;
  return true;
};
