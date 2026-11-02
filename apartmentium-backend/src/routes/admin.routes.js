import { Router } from "express";

import { authenticate, authorize } from "../middleware/auth.middleware.js";

const router = Router();

// Protect all routes in this router
router.use(authenticate, authorize("ADMIN"));

router.get("/dashboard", (req, res) => {
  res.status(200).json({
    success: true,
    message: "Admin dashboard route is protected.",
    user: req.user,
  });
});

export default router;
