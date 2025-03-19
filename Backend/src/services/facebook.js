import { FACEBOOK_PAGE_ACCESS_TOKEN } from "../config/index.js";
import { faceBookUrls } from "../utils/baseUrls.js";
import { reversePlatformMapping } from "../utils/mapping.js";
import { apiCaller } from "./apiCaller.js";
const query = { access_token: FACEBOOK_PAGE_ACCESS_TOKEN };

export const postToFacebook = async (ctx, data) => {
  const baseUrl = faceBookUrls["photos_post_url"];
  const response = await apiCaller(ctx, "post", baseUrl, query, data);

  return response.status === 200
    ? { success: true, postId: response.data.post_id, platform: 1 }
    : {
        success: false,
        message: "Not posted, please try again",
        platform: reversePlatformMapping[1],
      };
};

export const deleteFacebookPost = async (ctx, postId) => {
  const baseUrl = faceBookUrls["delete_post_url"] + `/${postId}`;
  const response = await apiCaller(ctx, "delete", baseUrl, query);
  return response.data.success
    ? { success: true, platform: 1 }
    : {
        success: false,
        message: "Post node deleted, please try again",
        platform: reversePlatformMapping[1],
      };
};
