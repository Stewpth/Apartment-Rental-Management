import "dotenv/config";
import nodemailer from "nodemailer";

const emailUser = process.env.EMAIL_USER;
const emailAppPassword = process.env.EMAIL_APP_PASSWORD;

if (!emailUser || !emailAppPassword) {
  throw new Error("Gmail email configuration is missing.");
}

const transporter = nodemailer.createTransport({
  host: "smtp.gmail.com",
  port: 465,
  secure: true,
  auth: {
    user: emailUser,
    pass: emailAppPassword,
  },
});

export async function sendEmail({ to, subject, html }) {
  try {
    const info = await transporter.sendMail({
      from: `Apartmentium <${emailUser}>`,
      to,
      subject,
      html,
    });

    return info;
  } catch (error) {
    console.error("Gmail email error:", error);
    throw new Error("Failed to send email.");
  }
}
