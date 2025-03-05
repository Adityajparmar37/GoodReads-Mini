import axios from "axios";
import {
  FACEBOOK_BASE_URL,
  INSTAGRAM_BASE_URL,
  INSTAGRAM_ID,
} from "../config/index.js";

export const postToInstagram = async (ctx, postData) => {
  try {
    const { title, description, coverImage, author, averageRating } = postData;

    const params = new URLSearchParams({
      caption: `📔 Title: ${title}\n\n 📃 About: ${description}\n\n\n ✒️ Author: ${author}\n\n\n ⭐ Rating: ${averageRating}`,
      image_url: coverImage,
      access_token: FACEBOOK_PAGE_ACCESS_TOKEN,
    });

    const postResponse = await axios.post(
      `${INSTAGRAM_BASE_URL}/${
        INSTAGRAM_ID
      }/media?${params.toString()}`
    );

    if (postResponse.status === 200) {
      const publishPostResponse = await axios.post(
        `${INSTAGRAM_BASE_URL}/${INSTAGRAM_ID}/media_publish?creation_id=${postResponse.data.id}&access_token=${FACEBOOK_PAGE_ACCESS_TOKEN}`
      );

      return publishPostResponse.status === 200
        ? { success: true, postId: postResponse.data.id, platform: 2 }
        : {
            success: false,
            message: "Not published, please try again",
            platform: 2,
          };
    } else {
      return {
        success: false,
        message: "Not Posted, please try again",
        platform: 2,
      };
    }
  } catch (error) {
    ctx.throw(
      400,
      `Instagram error ${
        error.response?.data?.error?.message || error.message
      }, please try again`
    );
  }
};
