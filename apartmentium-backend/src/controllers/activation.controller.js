import {
  sendActivationOtp,
  verifyActivationOtp,
} from "../services/activation.service.js";

export async function resendActivationOtp(req, res) {
  try {
    const { userId } = req.body;

    if (typeof userId !== "string" || !userId.trim()) {
      return res.status(400).json({
        success: false,
        message: "User ID is required.",
      });
    }

    const result = await sendActivationOtp(userId);

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
    const { userId, otp } = req.body;

    if (typeof userId !== "string" || !userId.trim()) {
      return res.status(400).json({
        success: false,
        message: "User ID is required.",
      });
    }

    const result = await verifyActivationOtp(userId, otp);

    return res.status(200).json(result);
  } catch (error) {
    return res.status(400).json({
      success: false,
      message: error.message || "Failed to activate account.",
    });
  }
}
