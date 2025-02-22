export const isPasswordValid = (password) => {
  const passwordRegex =
    /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{4,16}$/;
  if (password.trim().length === 0) return false;
  if (!passwordRegex.test(password)) return false;
  return true;
};
