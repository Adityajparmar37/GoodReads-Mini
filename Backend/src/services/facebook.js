import axios from "axios";

export const postToFacebook = async (ctx, postData) => {
  try {
    const { title, description, coverImage, author, averageRating } = postData;

    const facebookPostData = {
      message: `📔 Title: ${title}\u000A\u000A 📃 About: ${description}\u000A\u000A\u000A ✒️ Author: ${author}\u000A\u000A\u000A ⭐ Rating: ${averageRating}`,
      url: coverImage,
    };

    const response = await axios.post(
      `${process.env.FACEBOOK_BASE_URL}/${process.env.FACEBOOK_PAGE_ID}/photos?access_token=${process.env.FACEBOOK_PAGE_ACCESS_TOKEN}`,
      facebookPostData
    );

    return response.status === 200
      ? { success: true, postId: response.data.post_id, platform: 1 }
      : {
          success: false,
          message: "Not posted, please try again",
          platform: 1,
        };
  } catch (error) {
    ctx.throw(
      400,
      `Facebook error ${error.response.data.error.message},please try again`
    );
  }
};

export const deleteFacebookPost = async (ctx, postId) => {
  try {
    const response = await axios.delete(
      `${process.env.FACEBOOK_BASE_URL}/${postId}?access_token=${process.env.FACEBOOK_PAGE_ACCESS_TOKEN}`
    );

    return response.data.success
      ? { success: true, platform: 1 }
      : {
          success: false,
          message: "Post node deleted, please try again",
          platform: 1,
        };
  } catch (error) {
    ctx.throw(
      400,
      `Facebook error ${error.response.data.error.message}, please try again`
    );
  }
};
