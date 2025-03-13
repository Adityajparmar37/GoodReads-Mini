import { findFeatureActivationStatus } from "../query/featureActivationStatus.js";

export const featureActivationStatus = (featureName) => async (ctx, next) => {
  const result = await findFeatureActivationStatus({
    featureName,
  });

  if (!result?.isActive)
    return ctx.throw(403, "Feature is currently inactive, please try later");
  await next();
};
