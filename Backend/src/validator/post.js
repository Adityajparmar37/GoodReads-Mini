import { findPostById } from "../query/post.js";
import { isPlatformValid, isValidateId } from "../shared/index.js";
import { platformMapping } from "../utils/mapping.js";

export const validateSocialMediaPlatform = (ctx) => {
  const platforms = ctx.request.body?.platforms;
  if (!platforms)
    return {
      field: "platform",
      message: "Please provide social Media platform",
    };

  const { success, message } = isPlatformValid(platforms);

  if (!success)
    return {
      success: false,
      message,
    };

  ctx.state.post = {
    ...ctx.state.post,
    ...(platforms ? { platforms } : {}),
  };
};

export const validateSharedId = (ctx) => {
  const sharedId = ctx.params.sharedId;

  if (!sharedId)
    return {
      field: "shared Id",
      message: "Please provide share Id",
    };

  if (!isValidateId(sharedId))
    return {
      field: "shared Id",
      message: "Please provide valid shared Id",
    };

  ctx.state.shared = {
    ...ctx.state.shared,
    ...(sharedId ? { sharedId } : {}),
  };
};

export const isPostExist = async (ctx) => {
  const sharedId = ctx?.state?.shared;
  const result = await findPostById(sharedId);

  if (!result)
    return {
      field: "Post",
      message: "Post does not exist",
    };
};

export const validatePlatform = (ctx) => {
  const platformQuery = ctx.query.platform;
  if (
    platformQuery &&
    (typeof platformQuery !== "string" ||
      !["Facebook", "Instagram"].includes(platformQuery) ||
      platformQuery.trim().length === 0)
  )
    return {
      field: "platform",
      message: "Please provide valid platform",
    };

  const platform = platformMapping[platformQuery];

  ctx.state.shared = {
    ...ctx.state.shared,
    ...(platform ? { platform } : {}),
  };
};
