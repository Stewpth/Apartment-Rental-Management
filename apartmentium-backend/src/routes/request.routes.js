import { Router } from "express";
import { authenticate, authorize } from "../middleware/auth.middleware.js";
import { getRequestAttachment } from "../controllers/request.controller.js";

const router = Router();
router.get(
  "/attachments/:storageKey",
  authenticate,
  authorize("ADMIN", "TENANT"),
  getRequestAttachment,
);

export default router;
