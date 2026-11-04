import { Router } from "express";

import { authenticate, authorize } from "../middleware/auth.middleware.js";
import { getMyRental } from "../controllers/rental.controller.js";
import { getMyPayments } from "../controllers/payment.controller.js";
import {
  createTenantRequest,
  getRequestDetails,
  getTenantRequests,
} from "../controllers/request.controller.js";
import {
  getLatestTenantAnnouncements,
  markAnnouncementRead,
} from "../controllers/announcement.controller.js";
import { getTenantDashboard } from "../controllers/dashboard.controller.js";

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
router.get("/requests/me", getTenantRequests);
router.get("/announcements/latest", getLatestTenantAnnouncements);
router.post("/announcements/:id/read", markAnnouncementRead);
router.get("/dashboard/summary", getTenantDashboard);
router.post("/requests", createTenantRequest);
router.get("/requests/:id", getRequestDetails);

export default router;
