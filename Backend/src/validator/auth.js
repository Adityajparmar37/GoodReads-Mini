import {
  isEmailValid,
  isNameValid,
  isPasswordValid,
  isValidToken,
} from "../shared/index.js";
import { findUser } from "../query/auth.js";
import { comparePassword } from "../utils/password.js";

export const validateEmail = (ctx) => {
  const email = ctx.request.body?.email;

  if (!email) {
    return {
      field: "Email",
      message: "Email must be provide",
    };
  } else if (!isEmailValid(email)) {
    return {
      field: "Email",
      message: "Please provide a valid email",
    };
  }
  ctx.state.user = { ...ctx.state.user, ...(email ? { email } : {}) };
  return;
};

export const validatePassword = (ctx) => {
  const password = ctx.request.body?.password;

  if (!password) {
    return {
      field: "Password",
      message: "Password must be provide",
    };
  } else if (!isPasswordValid(password)) {
    return {
      field: "password",
      message: `Please provide a valid password:
- At least one uppercase letter
- At least one lowercase letter
- At least one digit
- At least one special character
- Minimum length of 8 characters
- Maximum length of 16 characters`,
    };
  }

  ctx.state.user = { ...ctx.state.user, ...(password ? { password } : {}) };
};

export const validateLastName = (ctx) => {
  const lastName = ctx.request.body?.lastName;

  if (!lastName) {
    return {
      field: "Last name",
      message: "Last name must be provide",
    };
  } else if (!isNameValid(lastName)) {
    return {
      field: "Last name",
      message: "Please provide valid last name",
    };
  }

  ctx.state.user = { ...ctx.state.user, ...(lastName ? { lastName } : {}) };
};

export const validateFirstName = (ctx) => {
  const firstName = ctx.request.body?.firstName;

  if (!firstName) {
    return {
      field: "First name",
      message: "First name must be provide",
    };
  } else if (!isNameValid(firstName)) {
    return {
      field: "First name",
      message: "Please provide valid first name",
    };
  }
  ctx.state.user = { ...ctx.state.user, ...(firstName ? { firstName } : {}) };
};

export const isUserExist = async (ctx) => {
  const { email } = ctx?.state.user;
  const isUserExist = await findUser(email);

  if (isUserExist) {
    return {
      field: "Register user",
      message: "User already exists",
    };
  }
};

export const validateLoginPassword = (ctx) => {
  const password = ctx.request.body?.password;

  if (!password) {
    return {
      field: "Password",
      message: "Password must be provide",
    };
  }

  ctx.state.user = { ...ctx.state.user, ...(password ? { password } : {}) };
  return;
};

export const validateLoginCredential = async (ctx) => {
  const { email, password } = ctx?.state.user;
  const userExist = await findUser(email);
  if (!userExist) {
    return {
      field: "Login user",
      message: "User does not exist, please register",
    };
  }

  if (!(await comparePassword(password, userExist.password))) {
    return {
      field: "Password",
      message: "Please enter valid password",
    };
  }

  ctx.state.user = {
    ...ctx.state.user,
    ...(userExist ? { ...userExist } : {}),
  };
};

export const validateToken = (ctx) => {
  const { init, token } = ctx?.query;

  if (!token || !init) {
    return {
      field: "verify user failed",
      message: "Link is not valid, please register again",
    };
  }
  const result = isValidToken(token, init);
  if (!result.success) {
    return {
      field: "verify user failed",
      message: result.message,
    };
  }

  ctx.state.user = {
    ...ctx.state.user,
    ...(result ? { userId: result.message.id } : {}),
  };
};

export const isUserVerified = async (ctx) => {
  const { email } = ctx?.state.user;
  const userData = await findUser(email);
  if (!userData?.isVerified) {
    return {
      field: "verify user failed",
      message: "User not veried, please register again",
    };
  }
};
