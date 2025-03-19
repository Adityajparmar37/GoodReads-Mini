import axios from "axios";

/**
 * Generic API caller utility that wraps axios
 *
 * @param {string} method - HTTP method (get, post, put, delete, etc.)
 * @param {string} baseUrl - The complete URL to call
 * @param {Object} data - Optional data payload for POST, PUT requests
 * @param {Object} params - Optional URL parameters
 * @returns {Promise} - Returns axios response or null if error
 */

export const apiCaller = async (
  ctx,
  method,
  baseUrl,
  query = null,
  data = null,
  headers = null
) =>
  await axios({
    method,
    url: baseUrl,
    data,
    params: query,
    headers,
  }).catch((error) => {
    //print it in slack
    // console.log(`API Call Error: ${error}`);
    ctx.throw(
      400,
      `error ${error?.response?.data?.error?.message}, please try again` ||
        error.message
    );
    return null;
  });
