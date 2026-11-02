import { Router } from "express";

import { authenticate, authorize } from "../middleware/auth.middleware.js";
import { getMyRental } from "../controllers/rental.controller.js";
import { getMyPayments } from "../controllers/payment.controller.js";

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

router.get("/rentals/me", getMyRental);
router.get("/payments/me", getMyPayments);

export default router;
