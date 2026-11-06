import { Router } from "express";

import { authenticate, authorize } from "../middleware/auth.middleware.js";
import {
  createUnit,
  getAvailableUnits,
  getUnoccupiedUnits,
  setUnitAvailableStatus,
  setUnitMaintenanceStatus,
} from "../controllers/unit.controller.js";
import {
  assignTenant,
  activateRentalTenant,
  changeTenantPassword,
  getRentalRecords,
  resendRentalTenantActivationOtp,
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
  getAdminRequests,
  getRequestDetails,
  updateRequest,
} from "../controllers/request.controller.js";
import {
  confirmMoveOut,
  markUnitReady,
  recordSettlementAdjustment,
  recordSettlementRefund,
} from "../controllers/settlement.controller.js";
import {
  createAnnouncement,
  getAnnouncements,
  updateAnnouncement,
} from "../controllers/announcement.controller.js";
import {
  getAdminDashboard,
  getAdminDashboardActivities,
} from "../controllers/admin-dashboard.controller.js";

const router = Router();

// Protect all routes in this router
router.use(authenticate, authorize("ADMIN"));

router.post("/units", createUnit);
router.get("/units/available", getAvailableUnits);
router.get("/units/unoccupied", getUnoccupiedUnits);
router.patch("/units/:unitId/maintenance", setUnitMaintenanceStatus);
router.patch("/units/:unitId/available", setUnitAvailableStatus);

router.post("/rentals/assign-tenant", assignTenant);
router.get("/rentals", getRentalRecords);
router.post("/rentals/:rentalId/activate-tenant", activateRentalTenant);
router.post(
  "/rentals/:rentalId/resend-activation-otp",
  resendRentalTenantActivationOtp,
);
router.post("/rentals/:rentalId/change-tenant-password", changeTenantPassword);
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
router.patch("/announcements/:id", updateAnnouncement);
router.get("/dashboard/summary", getAdminDashboard);
router.get("/dashboard/activities", getAdminDashboardActivities);

router.get("/dashboard", (req, res) => {
  res.status(200).json({
    success: true,
    message: "Admin dashboard route is protected.",
    user: req.user,
  });
});

export default router;
