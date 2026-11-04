import "dotenv/config";
import { sendEmail } from "../src/services/email.service.js";

if (!process.argv.includes("--send") || !process.env.TEST_EMAIL) {
  console.log("Skipped. Set TEST_EMAIL and pass --send to send a test message.");
  process.exit(0);
}

try {
  const result = await sendEmail({
    to: process.env.TEST_EMAIL,
    subject: "Apartmentium Email Test",
    html: "<h1>Hello from Apartmentium!</h1><p>This is a test email.</p>",
  });
  console.log("Test email accepted:", result.messageId);
} catch (error) {
  console.error("Email test failed:", error.message);
  process.exitCode = 1;
}
