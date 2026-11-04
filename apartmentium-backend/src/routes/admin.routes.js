import { Router } from "express";

import { authenticate, authorize } from "../middleware/auth.middleware.js";
import {
  createUnit,
  getAvailableUnits,
} from "../controllers/unit.controller.js";
import {
  assignTenant,
  getRentalRecords,
} from "../controllers/rental.controller.js";
import {
  getPaymentDetails,
  getPaymentRecords,
  recordPayment,
} from "../controllers/payment.controller.js";
import {
  requestTenantActivation,
  verifyTenantActivation,
  resendTenantActivationOtp,
} from "../controllers/pending-tenant.controller.js";
import {
  confirmMoveOut,
  getAdminRequests,
  getRequestDetails,
  markUnitReady,
  recordSettlementRefund,
  recordSettlementAdjustment,
  updateRequest,
} from "../controllers/request.controller.js";
import {
  createAnnouncement,
  getAnnouncements,
} from "../controllers/announcement.controller.js";

const router = Router();

// Protect all routes in this router
router.use(authenticate, authorize("ADMIN"));

router.post("/units", createUnit);
router.get("/units/available", getAvailableUnits);

router.post("/rentals/assign-tenant", assignTenant);
router.get("/rentals", getRentalRecords);
router.get("/payments", getPaymentRecords);
router.get("/payments/:rentalId", getPaymentDetails);
router.post("/payments/:rentalId", recordPayment);
router.get("/requests", getAdminRequests);
router.get("/requests/:id", getRequestDetails);
router.patch("/requests/:id", updateRequest);
router.post("/requests/:id/confirm-move-out", confirmMoveOut);
router.post("/settlements/:id/refunds", recordSettlementRefund);
router.post("/settlements/:id/adjustments", recordSettlementAdjustment);
router.post("/rentals/:rentalId/mark-unit-ready", markUnitReady);
router.post("/rentals/request-tenant-activation", requestTenantActivation);
router.post("/rentals/verify-tenant-activation", verifyTenantActivation);
router.post("/rentals/resend-tenant-activation", resendTenantActivationOtp);
router.get("/announcements", getAnnouncements);
router.post("/announcements", createAnnouncement);

router.get("/dashboard", (req, res) => {
  res.status(200).json({
    success: true,
    message: "Admin dashboard route is protected.",
    user: req.user,
  });
});

export default router;
