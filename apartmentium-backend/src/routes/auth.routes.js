import { Router } from "express";
import { getCurrentUser, login } from "../controllers/auth.controller.js";
import { authenticate, authorize } from "../middleware/auth.middleware.js";
import {
  resendActivationOtp,
  activateAccount,
} from "../controllers/activation.controller.js";

const router = Router();

router.post("/login", login);
router.get("/me", authenticate, getCurrentUser);

router.post("/activate/resend", resendActivationOtp);

router.post("/activate/verify", activateAccount);

router.get("/admin-test", authenticate, authorize("ADMIN"), (req, res) => {
  res.status(200).json({
    success: true,
    message: "Welcome, Admin!",
    user: req.user,
  });
});

export default router;
