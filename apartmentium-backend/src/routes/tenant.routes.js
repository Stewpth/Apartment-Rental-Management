import { Router } from "express";

import { authenticate, authorize } from "../middleware/auth.middleware.js";

const router = Router();

// Protect all routes in this router
router.use(authenticate, authorize("TENANT"));

router.get("/dashboard", (req, res) => {
  res.status(200).json({
    success: true,
    message: "Tenant dashboard route is protected.",
    user: req.user,
  });
});

export default router;
