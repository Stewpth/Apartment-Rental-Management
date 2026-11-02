import "dotenv/config";
import { sendEmail } from "../src/services/email.service.js";

async function testEmail() {
  try {
    const result = await sendEmail({
      to: "delivered@resend.dev",
      subject: "Apartmentium Email Test",
      html: `
        <h1>Hello from Apartmentium!</h1>
        <p>This is a test email sent using Resend.</p>
      `,
    });

    console.log("Email sent successfully!");
    console.log("Resend response:", result);
  } catch (error) {
    console.error("Email test failed:", error.message);
    process.exitCode = 1;
  }
}

testEmail();
