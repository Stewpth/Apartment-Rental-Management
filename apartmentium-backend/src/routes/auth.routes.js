import { Router } from "express";
import {
  changePassword,
  getCurrentUser,
  login,
  updateMyProfile,
} from "../controllers/auth.controller.js";
import { authenticate, authorize } from "../middleware/auth.middleware.js";
import {
  activationRateLimit,
  loginRateLimit,
  resendActivationRateLimit,
} from "../middleware/rate-limit.middleware.js";
import {
  getNotifications,
  markAllNotificationsRead,
  markNotificationRead,
} from "../controllers/notification.controller.js";
import {
  resendActivationOtp,
  activateAccount,
} from "../controllers/activation.controller.js";

const router = Router();

router.post("/login", loginRateLimit, login);
router.get("/me", authenticate, getCurrentUser);
router.get("/notifications", authenticate, getNotifications);
router.patch("/notifications/read-all", authenticate, markAllNotificationsRead);
router.patch("/notifications/:id/read", authenticate, markNotificationRead);
router.patch("/me/profile", authenticate, updateMyProfile);
router.patch("/me/password", authenticate, changePassword);

router.post("/activate/resend", resendActivationRateLimit, resendActivationOtp);

router.post("/activate/verify", activationRateLimit, activateAccount);

router.get("/admin-test", authenticate, authorize("ADMIN"), (req, res) => {
  res.status(200).json({
    success: true,
    message: "Welcome, Admin!",
    user: req.user,
  });
});

export default router;
