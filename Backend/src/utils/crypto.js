import crypto from "crypto";

// Use a constant key (32 bytes for aes-256-cbc)
const key = crypto.scryptSync(process.env.ENCRYPT_KEY, "salt", 32);

export const encrypt = (data) => {
  try {
    const iv = crypto.randomBytes(16);
    const cipher = crypto.createCipheriv(
      process.env.ENCRYPTION_ALGORITHM,
      key,
      iv
    );

    let encrypted = cipher.update(data, "utf8");
    encrypted = Buffer.concat([encrypted, cipher.final()]);

    return {
      iv: iv.toString("hex"),
      encryptedData: encrypted.toString("hex"),
    };
  } catch (error) {
    console.error(400, `error in encryption, ${error.message}`);
    return null;
  }
};

export const decrypt = (data) => {
  try {
    const iv = Buffer.from(data.iv, "hex");
    const encryptedText = Buffer.from(data.encryptedData, "hex");

    const decipher = crypto.createDecipheriv(
      process.env.ENCRYPTION_ALGORITHM,
      key,
      iv
    );

    let decrypted = decipher.update(encryptedText);
    decrypted = Buffer.concat([decrypted, decipher.final()]);

    return { success: true, decryptedData: decrypted.toString("utf8") };
  } catch (error) {
    return { success: false, message: "link is not valid. please register" };
  }
};

export const hashUserId = (userId) =>
  crypto.createHash("sha256").update(userId).digest("hex");
