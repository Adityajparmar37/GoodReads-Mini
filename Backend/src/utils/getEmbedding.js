import { openAI_embedding_url, openAI_key } from "../config/openAI.js";
import { apiCaller } from "../services/apiCaller.js";

export const getEmbedding = async (ctx, searchQuery) => {
  const response = await apiCaller(
    ctx,
    "post",
    openAI_embedding_url,
    null, //  No query parameters needed
    {
      input: searchQuery,
      model: "text-embedding-3-small",
    },
    {
      //set headers
      Authorization: `Bearer ${openAI_key}`,
      "Content-Type": "application/json",
    }
  );

  if (response && response.status === 200) {
    return response.data.data[0].embedding;
  } else {
    throw new Error(
      `Failed to get embedding. Status code: ${response?.status || "Unknown"}`
    );
  }
};
