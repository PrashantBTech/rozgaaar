const nodemailer = require("nodemailer");
require("dotenv").config();

async function test() {
  const transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: parseInt(process.env.SMTP_PORT),
    secure: false,
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS,
    },
  });

  try {
    const info = await transporter.verify();
    console.log("Success! Ready to send emails.", info);
  } catch (err) {
    console.error("Nodemailer Error:", err);
  }
}
test();
