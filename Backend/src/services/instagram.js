import { FACEBOOK_PAGE_ACCESS_TOKEN } from "../config/index.js";
import { apiCaller } from "../services/apiCaller.js";
import { instagramUrls } from "../utils/baseUrls.js";
import { reversePlatformMapping } from "../utils/mapping.js";

const query = { access_token: `${FACEBOOK_PAGE_ACCESS_TOKEN}` };

export const postToInstagram = async (ctx, postData) => {
  const { message: caption, url: image_url } = postData;

  //need to pass post data as query for instagram api endpoint 
  const postQuery = {
    ...query,
    ...Object.fromEntries(new URLSearchParams({ caption, image_url })),
  };

  const baseUrl = instagramUrls["post_url"];
  const postResponse = await apiCaller(ctx, "post", baseUrl, postQuery);

  if (postResponse.status === 200) {
    const publishUrl = instagramUrls["publish_url"];
    const publishQuery = {
      ...query,
      creation_id: postResponse.data.id,
    };

    const publishPostResponse = await apiCaller(
      ctx,
      "post",
      publishUrl,
      publishQuery
    );

    return publishPostResponse.status === 200
      ? { success: true, postId: postResponse.data.id, platform: 2 }
      : {
          success: false,
          message: "Not published, please try again",
          platform: reversePlatformMapping[2],
        };
  } else {
    return {
      success: false,
      message: "Not Posted, please try again",
      platform: reversePlatformMapping[2],
    };
  }
};
