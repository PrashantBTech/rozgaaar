const nodemailer = require("nodemailer");
const logger = require("./logger");

const sendEmail = async ({ to, subject, html, text }) => {
  const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: process.env.SMTP_USER?.trim(),
      pass: process.env.SMTP_PASS?.trim(),
    },
  });

  const mailOptions = {
    from: `"${process.env.FROM_NAME}" <${process.env.FROM_EMAIL}>`,
    to,
    subject,
    html,
    text: text || html.replace(/<[^>]*>/g, ""),
  };

  try {
    const info = await transporter.sendMail(mailOptions);
    logger.info(`📧 Email sent to ${to}: ${info.messageId}`);
    return info;
  } catch (err) {
    console.error("NODEMAILER ERROR:", err);
    throw err;
  }
};

module.exports = sendEmail;
