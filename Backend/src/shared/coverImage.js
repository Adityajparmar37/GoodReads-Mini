export const isValidCoverImage = (coverImageUrl) => {
  if (typeof coverImageUrl !== "string" || !coverImageUrl.trim()) {
    return { field: "cover image", message: "Invalid image URL." };
  }

  const s3Pattern = /^https:\/\/.*\.s3\.[a-z0-9-]+\.amazonaws\.com\/.+$/;
  if (!s3Pattern.test(coverImageUrl)) {
    return { field: "cover image", message: "Only AWS S3 URLs are allowed." };
  }

  const allowedExtensions = ["png", "jpg", "jpeg", "webp"];
  const fileExtension = coverImageUrl.split(".").pop().toLowerCase();

  if (!allowedExtensions.includes(fileExtension)) {
    return {
      field: "cover image",
      message: "Allowed formats are PNG, JPG, JPEG, WEBP",
    };
  }

  return { success: true };
};
