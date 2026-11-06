import "dotenv/config";

const brevoApiKey = process.env.BREVO_API_KEY;
const emailFrom = process.env.EMAIL_FROM;

if (!brevoApiKey || !emailFrom) {
  throw new Error(
    "Brevo email configuration is missing (BREVO_API_KEY, EMAIL_FROM).",
  );
}

const senderMatch = emailFrom.match(/^\s*(.*?)\s*<([^<>]+)>\s*$/);
const sender = senderMatch
  ? { name: senderMatch[1], email: senderMatch[2] }
  : { email: emailFrom.trim() };

console.log("Brevo sender:", sender);

export async function sendEmail({ to, subject, html }) {
  try {
    const response = await fetch("https://api.brevo.com/v3/smtp/email", {
      method: "POST",
      headers: {
        "api-key": brevoApiKey,
        Accept: "application/json",
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        sender,
        to: [{ email: to }],
        subject,
        htmlContent: html,
      }),
    });

    const result = await response.json().catch(() => ({}));
    if (!response.ok) {
      console.error("Brevo email error:", result);
      throw new Error(
        result.message || `Brevo returned HTTP ${response.status}.`,
      );
    }

    return result;
  } catch (error) {
    console.error("Brevo email error:", error);
    throw new Error("Failed to send email.", { cause: error });
  }
}
