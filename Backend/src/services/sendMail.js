import nodemailer from "nodemailer";
import pug from "pug";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL,
    pass: process.env.MAILPASS,
  },
});

const renderTemplate = (templateName, data) => {
  const filePath = path.join(__dirname, "../views", `${templateName}.pug`);

  return pug.renderFile(filePath, data);
};

export const sendEmailMail = async (to, filePath, data) => {
  try {
    const mailOptions = {
      from: "adityasocialpilot@gmail.com",
      to,
      subject: "GoodReads verify email",
      html: renderTemplate(filePath, data),
    };
    await transporter.sendMail(mailOptions);
    return true;
  } catch (error) {
    console.error(400, `Email error:, ${error}`);
    return false;
  }
};
