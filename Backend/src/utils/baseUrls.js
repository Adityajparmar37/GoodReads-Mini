import { FACEBOOK_BASE_URL, FACEBOOK_PAGE_ID, INSTAGRAM_BASE_URL, INSTAGRAM_ID } from "../config/index.js";

export const faceBookUrls = {
  photos_post_url: `${FACEBOOK_BASE_URL}/${FACEBOOK_PAGE_ID}/photos`,
  delete_post_url: `${FACEBOOK_BASE_URL}`,
};

export const instagramUrls = {
  post_url: `${INSTAGRAM_BASE_URL}/${INSTAGRAM_ID}/media`,
  publish_url: `${INSTAGRAM_BASE_URL}/${INSTAGRAM_ID}/media_publish`,
};
