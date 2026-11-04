import { rateLimit } from "express-rate-limit";

function limitMessage(message) {
  return {
    success: false,
    message,
  };
}

export const loginRateLimit = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 10,
  standardHeaders: "draft-8",
  legacyHeaders: false,
  message: limitMessage("Too many sign-in attempts. Try again in 15 minutes."),
});

export const activationRateLimit = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 8,
  standardHeaders: "draft-8",
  legacyHeaders: false,
  message: limitMessage("Too many activation attempts. Try again in 15 minutes."),
});

export const resendActivationRateLimit = rateLimit({
  windowMs: 60 * 60 * 1000,
  limit: 5,
  standardHeaders: "draft-8",
  legacyHeaders: false,
  message: limitMessage("Too many activation emails requested. Try again in an hour."),
});
