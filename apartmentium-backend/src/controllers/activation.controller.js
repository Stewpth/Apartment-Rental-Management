import {
  resendActivationOtpForEmail,
  verifyActivationOtpForEmail,
} from "../services/activation.service.js";

export async function resendActivationOtp(req, res) {
  try {
    const { email } = req.body;

    if (typeof email !== "string" || !email.trim()) {
      return res.status(400).json({
        success: false,
        message: "Email address is required.",
      });
    }

    const result = await resendActivationOtpForEmail(email);

    return res.status(200).json(result);
  } catch (error) {
    return res.status(400).json({
      success: false,
      message: error.message || "Failed to send activation OTP.",
    });
  }
}

export async function activateAccount(req, res) {
  try {
    const { email, otp } = req.body;

    if (typeof email !== "string" || !email.trim()) {
      return res.status(400).json({
        success: false,
        message: "Email address is required.",
      });
    }

    const result = await verifyActivationOtpForEmail(email, otp);

    return res.status(200).json(result);
  } catch (error) {
    return res.status(400).json({
      success: false,
      message: error.message || "Failed to activate account.",
    });
  }
}
