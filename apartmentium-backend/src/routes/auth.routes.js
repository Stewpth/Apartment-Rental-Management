import { Router } from "express";
import { login } from "../controllers/auth.controller.js";
import { authenticate, authorize } from "../middleware/auth.middleware.js";

const router = Router();

router.post("/login", login);

router.get("/admin-test", authenticate, authorize("ADMIN"), (req, res) => {
  res.status(200).json({
    success: true,
    message: "Welcome, Admin!",
    user: req.user,
  });
});

export default router;
