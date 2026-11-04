import { Router } from "express";
import prisma from "../config/prisma.js";
import { checkRequestAttachmentStorage } from "../config/supabase.js";

const router = Router();

router.get("/", (req, res) => {
  res.status(200).json({
    success: true,
    message: "Apartmentium API is running",
  });
});

router.get("/ready", async (req, res) => {
  const [database, attachmentStorage] = await Promise.allSettled([
    prisma.$queryRaw`SELECT 1`,
    checkRequestAttachmentStorage(),
  ]);
  const checks = {
    database: database.status === "fulfilled",
    attachmentStorage: attachmentStorage.status === "fulfilled",
  };
  const ready = checks.database && checks.attachmentStorage;

  return res.status(ready ? 200 : 503).json({
    success: ready,
    status: ready ? "ready" : "not_ready",
    checks,
  });
});

export default router;
