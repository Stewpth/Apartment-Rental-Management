import { Router } from "express";

import { authenticate, authorize } from "../middleware/auth.middleware.js";
import {
  createUnit,
  getAvailableUnits,
} from "../controllers/unit.controller.js";
import { assignTenant } from "../controllers/rental.controller.js";
import {
  requestTenantActivation,
  verifyTenantActivation,
  resendTenantActivationOtp,
} from "../controllers/pending-tenant.controller.js";

const router = Router();

// Protect all routes in this router
router.use(authenticate, authorize("ADMIN"));

router.post("/units", createUnit);
router.get("/units/available", getAvailableUnits);

router.post("/rentals/assign-tenant", assignTenant);
router.post("/rentals/request-tenant-activation", requestTenantActivation);
router.post("/rentals/verify-tenant-activation", verifyTenantActivation);
router.post("/rentals/resend-tenant-activation", resendTenantActivationOtp);

router.get("/dashboard", (req, res) => {
  res.status(200).json({
    success: true,
    message: "Admin dashboard route is protected.",
    user: req.user,
  });
});

export default router;
