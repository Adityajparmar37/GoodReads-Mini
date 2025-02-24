import Bluebird from "bluebird";
import { sendResponse } from "../utils/sendResponse.js";

export const validator = (validators) => async (ctx, next) => {
  const errors = [];

  await Bluebird.mapSeries(validators, async (validator) => {
    const error = await validator(ctx);
    if (error) return errors.push(error);
  });

  if (errors.length > 0) {
    sendResponse(ctx, 400, {
      response: "Validator Errors: ",
      error: errors,
    });
    return;
  }

  await next();
};
