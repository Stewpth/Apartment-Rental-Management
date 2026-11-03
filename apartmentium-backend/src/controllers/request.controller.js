import { randomUUID } from "node:crypto";
import { mkdir, writeFile, unlink, readFile } from "node:fs/promises";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import prisma from "../config/prisma.js";
import { ensureMonthlyDues } from "./payment.controller.js";

const uploadRoot = join(
  dirname(fileURLToPath(import.meta.url)),
  "../../uploads/requests",
);
const imageTypes = new Set(["image/jpeg", "image/png"]);
const validCategories = new Set([
  "REPAIR",
  "PERMISSION",
  "COMPLAINT",
  "MOVING_OUT",
]);
const statusOrder = ["PENDING", "IN_PROGRESS", "RESOLVED", "REJECTED"];

function validDate(value) {
  if (typeof value !== "string" || !/^\d{4}-\d{2}-\d{2}$/.test(value))
    return null;
  const date = new Date(`${value}T00:00:00.000Z`);
  return Number.isNaN(date.getTime()) ||
    date.toISOString().slice(0, 10) !== value
    ? null
    : date;
}

function publicRequest(request) {
  const profile = request.rental.tenant.user.profile;
  return {
    id: request.id,
    reference: request.reference,
    title: request.title,
    description: request.description,
    category: request.category,
    status: request.status,
    reason: request.reason,
    requestedMoveOutDate:
      request.requestedMoveOutDate?.toISOString().slice(0, 10) ?? null,
    priority: request.priority,
    adminNotes: request.adminNotes,
    createdAt: request.createdAt,
    updatedAt: request.updatedAt,
    resolvedAt: request.resolvedAt,
    tenant: {
      id: request.rental.tenant.id,
      fullName: profile?.fullName ?? request.rental.tenant.user.username,
      unitNumber: request.rental.unit.unitNumber,
    },
    rental: {
      id: request.rental.id,
      status: request.rental.status,
      monthlyRent: request.rental.monthlyRent.toString(),
      unitStatus: request.rental.unit.status,
    },
    attachments: request.attachments.map((file) => ({
      ...file,
      url: `/requests/attachments/${file.storageKey}`,
    })),
    updates: request.updates.map((update) => ({
      id: update.id,
      status: update.status,
      message: update.message,
      createdAt: update.createdAt,
      authorName: update.author.profile?.fullName ?? update.author.username,
    })),
    settlement: request.settlement
      ? {
          id: request.settlement.id,
          unpaidDues: request.settlement.unpaidDues.toString(),
          unusedRentCredit: request.settlement.unusedRentCredit.toString(),
          existingTenantCredit:
            request.settlement.existingTenantCredit.toString(),
          tenantCreditRefund: request.settlement.tenantCreditRefund.toString(),
          approvedCharges: request.settlement.approvedCharges.toString(),
          creditsApplied: request.settlement.creditsApplied.toString(),
          originalBalance: request.settlement.originalBalance.toString(),
          amountOwed: request.settlement.amountOwed.toString(),
          refundDue: request.settlement.refundDue.toString(),
          refunds: request.settlement.refunds,
          adjustments: request.settlement.adjustments,
          dueSnapshots: request.settlement.dueSnapshots.map((due) => ({
            billingPeriod: due.billingPeriod.toISOString().slice(0, 10),
            dueDate: due.dueDate.toISOString().slice(0, 10),
            amountDue: due.amountDue.toString(),
            amountPaid: due.amountPaid.toString(),
            balance: due.balance.toString(),
          })),
        }
      : null,
  };
}

const includeRequest = {
  rental: {
    include: {
      unit: true,
      tenant: { include: { user: { include: { profile: true } } } },
    },
  },
  attachments: true,
  updates: {
    orderBy: { createdAt: "asc" },
    include: { author: { include: { profile: true } } },
  },
  settlement: {
    include: {
      refunds: true,
      adjustments: true,
      dueSnapshots: { orderBy: { billingPeriod: "asc" } },
    },
  },
};

async function persistAttachments(files) {
  if (!Array.isArray(files)) throw new Error("INVALID_ATTACHMENTS");
  if (files.length > 3) throw new Error("TOO_MANY_ATTACHMENTS");
  const stored = [];
  try {
    for (const file of files) {
      if (
        !file ||
        !imageTypes.has(file.mimeType) ||
        typeof file.data !== "string"
      )
        throw new Error("INVALID_ATTACHMENT");
      const match = file.data.match(
        /^data:(image\/(?:jpeg|png));base64,([A-Za-z0-9+/=]+)$/,
      );
      if (!match || match[1] !== file.mimeType)
        throw new Error("INVALID_ATTACHMENT");
      const buffer = Buffer.from(match[2], "base64");
      if (
        !buffer.length ||
        buffer.length > 5 * 1024 * 1024 ||
        buffer.toString("base64") !== match[2]
      )
        throw new Error("INVALID_ATTACHMENT");
      const extension = file.mimeType === "image/png" ? ".png" : ".jpg";
      const storageKey = `${randomUUID()}${extension}`;
      await mkdir(uploadRoot, { recursive: true });
      await writeFile(join(uploadRoot, storageKey), buffer, { flag: "wx" });
      stored.push({
        storageKey,
        fileName: String(file.fileName || "image")
          .replace(/[\\/\0]/g, "_")
          .slice(0, 255),
        mimeType: file.mimeType,
        sizeBytes: buffer.length,
      });
    }
    return stored;
  } catch (error) {
    await Promise.all(
      stored.map((file) =>
        unlink(join(uploadRoot, file.storageKey)).catch(() => {}),
      ),
    );
    throw error;
  }
}

export async function createTenantRequest(req, res) {
  let stored = [];
  try {
    const category = String(req.body.category ?? "").toUpperCase();
    const title =
      typeof req.body.title === "string" ? req.body.title.trim() : "";
    const description =
      typeof req.body.description === "string"
        ? req.body.description.trim()
        : "";
    const reason =
      typeof req.body.reason === "string" ? req.body.reason.trim() : "";
    const attachments = req.body.attachments ?? [];
    if (!validCategories.has(category))
      return res
        .status(400)
        .json({ success: false, message: "Choose a valid request category." });
    if (!title || title.length > 120)
      return res
        .status(400)
        .json({
          success: false,
          message: "Title is required and must be 120 characters or fewer.",
        });
    if (!description || description.length > 500)
      return res
        .status(400)
        .json({
          success: false,
          message:
            "Description is required and must be 500 characters or fewer.",
        });
    if (
      (category === "REPAIR" || category === "COMPLAINT") &&
      attachments.length > 3
    )
      return res
        .status(400)
        .json({ success: false, message: "You can attach up to 3 images." });
    if (category !== "REPAIR" && category !== "COMPLAINT" && attachments.length)
      return res
        .status(400)
        .json({
          success: false,
          message:
            "Attachments are only allowed for repair and complaint requests.",
        });
    if (
      category === "MOVING_OUT" &&
      (!validDate(req.body.requestedMoveOutDate) || reason.length > 500)
    )
      return res
        .status(400)
        .json({
          success: false,
          message:
            "Enter a valid requested move-out date and a reason of 500 characters or fewer.",
        });

    const rental = await prisma.rental.findFirst({
      where: {
        tenant: { userId: req.user.id },
        status: { in: ["ACTIVE", "ON_LEAVING"] },
      },
      orderBy: { createdAt: "desc" },
    });
    if (!rental)
      return res
        .status(409)
        .json({
          success: false,
          message: "An active rental is required to create a request.",
        });
    if (category === "MOVING_OUT") {
      const activeRequest = await prisma.tenantRequest.findFirst({
        where: {
          rentalId: rental.id,
          category,
          status: { in: ["PENDING", "IN_PROGRESS"] },
        },
      });
      if (activeRequest || rental.status === "ON_LEAVING")
        return res
          .status(409)
          .json({
            success: false,
            message: "A moving-out request is already active for this rental.",
          });
    }
    stored = await persistAttachments(attachments);
    const created = await prisma.tenantRequest.create({
      data: {
        rentalId: rental.id,
        category,
        title,
        description,
        reason: category === "MOVING_OUT" ? reason || null : null,
        requestedMoveOutDate:
          category === "MOVING_OUT"
            ? validDate(req.body.requestedMoveOutDate)
            : null,
        reference: `REQ-${Date.now()}-${randomUUID().slice(0, 6)}`,
        attachments: { create: stored },
        updates: {
          create: {
            authorId: req.user.id,
            status: "PENDING",
            message: "Request submitted.",
          },
        },
      },
      include: includeRequest,
    });
    return res
      .status(201)
      .json({ success: true, data: publicRequest(created) });
  } catch (error) {
    await Promise.all(
      stored.map((file) =>
        unlink(join(uploadRoot, file.storageKey)).catch(() => {}),
      ),
    );
    if (
      [
        "INVALID_ATTACHMENTS",
        "TOO_MANY_ATTACHMENTS",
        "INVALID_ATTACHMENT",
      ].includes(error.message)
    )
      return res
        .status(400)
        .json({
          success: false,
          message:
            "Attachments must be up to 3 PNG or JPEG images, each no larger than 5 MB.",
        });
    if (error.code === "P2002")
      return res
        .status(409)
        .json({
          success: false,
          message: "A moving-out request is already active for this rental.",
        });
    console.error("Create tenant request error:", error);
    return res
      .status(500)
      .json({ success: false, message: "Failed to create request." });
  }
}

export async function getTenantRequests(req, res) {
  try {
    const requests = await prisma.tenantRequest.findMany({
      where: { rental: { tenant: { userId: req.user.id } } },
      orderBy: { createdAt: "desc" },
      include: includeRequest,
    });
    return res.json({
      success: true,
      count: requests.length,
      data: requests.map(publicRequest),
    });
  } catch (error) {
    console.error("Get tenant requests error:", error);
    return res
      .status(500)
      .json({ success: false, message: "Failed to retrieve your requests." });
  }
}

export async function getAdminRequests(req, res) {
  try {
    const { status, category, search } = req.query;
    const where = {};
    if (statusOrder.includes(status)) where.status = status;
    if (validCategories.has(category)) where.category = category;
    if (typeof search === "string" && search.trim())
      where.OR = [
        { title: { contains: search.trim(), mode: "insensitive" } },
        { description: { contains: search.trim(), mode: "insensitive" } },
        {
          rental: {
            unit: {
              unitNumber: { contains: search.trim(), mode: "insensitive" },
            },
          },
        },
        {
          rental: {
            tenant: {
              user: {
                profile: {
                  fullName: { contains: search.trim(), mode: "insensitive" },
                },
              },
            },
          },
        },
      ];
    const requests = await prisma.tenantRequest.findMany({
      where,
      orderBy: { createdAt: "desc" },
      include: includeRequest,
    });
    return res.json({
      success: true,
      count: requests.length,
      data: requests.map(publicRequest),
    });
  } catch (error) {
    console.error("Get admin requests error:", error);
    return res
      .status(500)
      .json({ success: false, message: "Failed to retrieve requests." });
  }
}

export async function getRequestDetails(req, res) {
  try {
    const request = await prisma.tenantRequest.findUnique({
      where: { id: req.params.id },
      include: includeRequest,
    });
    if (
      !request ||
      (req.user.role === "TENANT" &&
        request.rental.tenant.userId !== req.user.id)
    )
      return res
        .status(404)
        .json({ success: false, message: "Request not found." });
    return res.json({ success: true, data: publicRequest(request) });
  } catch (error) {
    console.error("Get request details error:", error);
    return res
      .status(500)
      .json({ success: false, message: "Failed to retrieve request details." });
  }
}

export async function getRequestAttachment(req, res) {
  try {
    if (!/^[0-9a-f-]{36}\.(jpg|png)$/.test(req.params.storageKey))
      return res
        .status(404)
        .json({ success: false, message: "Attachment not found." });
    const attachment = await prisma.requestAttachment.findFirst({
      where: { storageKey: req.params.storageKey },
      include: {
        request: { include: { rental: { include: { tenant: true } } } },
      },
    });
    if (
      !attachment ||
      (req.user.role === "TENANT" &&
        attachment.request.rental.tenant.userId !== req.user.id)
    )
      return res
        .status(404)
        .json({ success: false, message: "Attachment not found." });
    const bytes = await readFile(join(uploadRoot, attachment.storageKey));
    res.setHeader("Content-Type", attachment.mimeType);
    res.setHeader(
      "Content-Disposition",
      `inline; filename="${attachment.fileName.replace(/[\"\r\n]/g, "_")}"`,
    );
    res.setHeader("Cache-Control", "private, no-store");
    return res.send(bytes);
  } catch (error) {
    if (error.code === "ENOENT")
      return res
        .status(404)
        .json({ success: false, message: "Attachment not found." });
    console.error("Get request attachment error:", error);
    return res
      .status(500)
      .json({ success: false, message: "Failed to retrieve attachment." });
  }
}

function nextStatus(category, current, target) {
  if (target === "REJECTED") return current === "PENDING";
  if (target === "IN_PROGRESS")
    return (
      current === "PENDING" &&
      ["REPAIR", "COMPLAINT", "MOVING_OUT"].includes(category)
    );
  if (target === "RESOLVED")
    return (
      (category === "PERMISSION" && current === "PENDING") ||
      (["REPAIR", "COMPLAINT"].includes(category) && current === "IN_PROGRESS")
    );
  return false;
}

export async function updateRequest(req, res) {
  try {
    const request = await prisma.tenantRequest.findUnique({
      where: { id: req.params.id },
      include: { rental: true },
    });
    if (!request)
      return res
        .status(404)
        .json({ success: false, message: "Request not found." });
    const { status, priority, adminNotes, message } = req.body;
    if (
      priority !== undefined &&
      !["LOW", "NORMAL", "HIGH", "URGENT"].includes(priority)
    )
      return res
        .status(400)
        .json({ success: false, message: "Choose a valid priority." });
    if (
      adminNotes !== undefined &&
      (typeof adminNotes !== "string" || adminNotes.length > 2000)
    )
      return res
        .status(400)
        .json({
          success: false,
          message: "Admin notes must be 2,000 characters or fewer.",
        });
    if (
      status !== undefined &&
      !nextStatus(request.category, request.status, status)
    )
      return res
        .status(409)
        .json({
          success: false,
          message: "That status transition is not allowed for this request.",
        });
    if (
      request.category === "MOVING_OUT" &&
      status === "IN_PROGRESS" &&
      request.rental.status !== "ACTIVE"
    )
      return res
        .status(409)
        .json({
          success: false,
          message: "Only an active rental can be approved to move out.",
        });
    if (request.category === "MOVING_OUT" && status === "IN_PROGRESS")
      await ensureMonthlyDues(request.rental);
    const updated = await prisma.$transaction(
      async (tx) => {
        if (request.category === "MOVING_OUT" && status === "IN_PROGRESS") {
          await tx.rental.update({
            where: { id: request.rentalId },
            data: { status: "ON_LEAVING", leavingRequestedAt: new Date() },
          });
        }
        const changed = await tx.tenantRequest.update({
          where: { id: request.id },
          data: {
            ...(status
              ? {
                  status,
                  resolvedAt:
                    status === "RESOLVED" || status === "REJECTED"
                      ? new Date()
                      : null,
                }
              : {}),
            ...(priority !== undefined ? { priority } : {}),
            ...(adminNotes !== undefined
              ? { adminNotes: adminNotes || null }
              : {}),
            ...(status || message
              ? {
                  updates: {
                    create: {
                      authorId: req.user.id,
                      status: status ?? null,
                      message:
                        typeof message === "string"
                          ? message.slice(0, 2000)
                          : null,
                    },
                  },
                }
              : {}),
          },
          include: includeRequest,
        });
        return changed;
      },
      { isolationLevel: "Serializable" },
    );
    return res.json({ success: true, data: publicRequest(updated) });
  } catch (error) {
    if (error.code === "P2034")
      return res
        .status(409)
        .json({
          success: false,
          message:
            "This request changed while you were updating it. Refresh and try again.",
        });
    console.error("Update request error:", error);
    return res
      .status(500)
      .json({ success: false, message: "Failed to update request." });
  }
}

function dateAtUtc(date) {
  return Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate());
}
function dueDateForPeriod(moveInDate, year, month) {
  const day = moveInDate.getUTCDate();
  const target = new Date(Date.UTC(year, month + 1, 0)).getUTCDate();
  return new Date(Date.UTC(year, month, Math.min(day, target)));
}

export async function confirmMoveOut(req, res) {
  try {
    const actualMoveOutDate = validDate(req.body.actualMoveOutDate);
    if (!actualMoveOutDate)
      return res
        .status(400)
        .json({
          success: false,
          message: "Enter a valid actual move-out date.",
        });
    const today = new Date();
    today.setUTCHours(0, 0, 0, 0);
    if (actualMoveOutDate > today)
      return res
        .status(400)
        .json({
          success: false,
          message: "Actual move-out date cannot be in the future.",
        });
    const result = await prisma.$transaction(
      async (tx) => {
        const request = await tx.tenantRequest.findUnique({
          where: { id: req.params.id },
          include: { rental: { include: { monthlyDues: true, credit: true } } },
        });
        if (!request || request.category !== "MOVING_OUT")
          throw new Error("MOVING_REQUEST_NOT_FOUND");
        if (
          request.status !== "IN_PROGRESS" ||
          request.rental.status !== "ON_LEAVING"
        )
          throw new Error("MOVING_REQUEST_NOT_APPROVED");
        if (actualMoveOutDate < request.rental.moveInDate)
          throw new Error("INVALID_MOVE_OUT_DATE");
        const dues = request.rental.monthlyDues;
        const unpaidDuesCents = dues.reduce(
          (sum, due) =>
            sum + Math.max(0, Math.round(Number(due.balance) * 100)),
          0,
        );
        const moveOutPeriodDue =
          dues.find(
            (due) =>
              due.billingPeriod.getUTCFullYear() ===
                actualMoveOutDate.getUTCFullYear() &&
              due.billingPeriod.getUTCMonth() ===
                actualMoveOutDate.getUTCMonth(),
          )?.dueDate ?? null;
        let unusedRentCreditCents = 0;
        if (moveOutPeriodDue && actualMoveOutDate < moveOutPeriodDue) {
          const days = Math.max(
            0,
            (dateAtUtc(moveOutPeriodDue) - dateAtUtc(actualMoveOutDate)) /
              86400000,
          );
          const dailyRentCents = Math.round(
            (Number(request.rental.monthlyRent) / 30) * 100,
          );
          unusedRentCreditCents = dailyRentCents * days;
        }
        const existingTenantCreditCents = Math.max(
          0,
          Math.round(Number(request.rental.credit?.balance ?? 0) * 100),
        );
        const approvedChargesCents = 0;
        const originalBalanceCents =
          unpaidDuesCents +
          approvedChargesCents -
          unusedRentCreditCents -
          existingTenantCreditCents;
        const unusedRentCreditAppliedCents = Math.min(
          unusedRentCreditCents,
          unpaidDuesCents,
        );
        const existingCreditAppliedCents = Math.min(
          existingTenantCreditCents,
          Math.max(0, unpaidDuesCents - unusedRentCreditAppliedCents),
        );
        const creditsAppliedCents =
          unusedRentCreditAppliedCents + existingCreditAppliedCents;
        const tenantCreditRefundCents = Math.max(
          0,
          existingTenantCreditCents +
            unusedRentCreditCents -
            creditsAppliedCents,
        );
        const settlement = await tx.finalSettlement.create({
          data: {
            rentalId: request.rentalId,
            requestId: request.id,
            confirmedById: req.user.id,
            unpaidDues: unpaidDuesCents / 100,
            unusedRentCredit: unusedRentCreditCents / 100,
            existingTenantCredit: existingTenantCreditCents / 100,
            approvedCharges: 0,
            tenantCreditRefund: tenantCreditRefundCents / 100,
            creditsApplied: creditsAppliedCents / 100,
            originalBalance: originalBalanceCents / 100,
            amountOwed: Math.max(0, originalBalanceCents) / 100,
            refundDue: Math.max(0, -originalBalanceCents) / 100,
          },
        });
        const unpaidDueRows = dues.filter((due) => Number(due.balance) > 0);
        if (unpaidDueRows.length)
          await tx.settlementDueSnapshot.createMany({
            data: unpaidDueRows.map((due) => ({
              settlementId: settlement.id,
              monthlyDueId: due.id,
              billingPeriod: due.billingPeriod,
              dueDate: due.dueDate,
              amountDue: due.amountDue,
              amountPaid: due.amountPaid,
              balance: due.balance,
            })),
          });
        if (existingTenantCreditCents || unusedRentCreditCents) {
          const tenantCredit = unusedRentCreditCents
            ? await tx.tenantCredit.upsert({
                where: { rentalId: request.rentalId },
                create: {
                  rentalId: request.rentalId,
                  balance: unusedRentCreditCents / 100,
                },
                update: { balance: { increment: unusedRentCreditCents / 100 } },
              })
            : request.rental.credit;
          if (unusedRentCreditCents)
            await tx.creditTransaction.create({
              data: {
                tenantCreditId: tenantCredit.id,
                type: "CREDIT_CREATED",
                amount: unusedRentCreditCents / 100,
                recordedById: req.user.id,
                notes: `Unused rent credit for final settlement ${settlement.id}`,
              },
            });
          let remainingCreditCents = creditsAppliedCents;
          const creditDues = dues
            .filter((due) => Number(due.balance) > 0)
            .sort(
              (left, right) =>
                left.billingPeriod - right.billingPeriod ||
                left.dueDate - right.dueDate,
            );
          for (const due of creditDues) {
            if (remainingCreditCents <= 0) break;
            const dueBalanceCents = Math.round(Number(due.balance) * 100);
            const appliedCents = Math.min(
              remainingCreditCents,
              dueBalanceCents,
            );
            const amountPaidCents =
              Math.round(Number(due.amountPaid) * 100) + appliedCents;
            const balanceCents = dueBalanceCents - appliedCents;
            await tx.monthlyDue.update({
              where: { id: due.id },
              data: {
                amountPaid: amountPaidCents / 100,
                balance: balanceCents / 100,
                status: balanceCents === 0 ? "PAID" : "PARTIAL",
              },
            });
            await tx.creditTransaction.create({
              data: {
                tenantCreditId: tenantCredit.id,
                type: "CREDIT_APPLIED",
                amount: appliedCents / 100,
                monthlyDueId: due.id,
                recordedById: req.user.id,
                notes: `Applied to final settlement ${settlement.id}`,
              },
            });
            remainingCreditCents -= appliedCents;
          }
          if (creditsAppliedCents)
            await tx.tenantCredit.update({
              where: { rentalId: request.rentalId },
              data: { balance: { decrement: creditsAppliedCents / 100 } },
            });
        }
        await tx.rental.update({
          where: { id: request.rentalId },
          data: { status: "ENDED", endDate: actualMoveOutDate },
        });
        await tx.unit.update({
          where: { id: request.rental.unitId },
          data: { status: "MAINTENANCE" },
        });
        const updatedRequest = await tx.tenantRequest.update({
          where: { id: request.id },
          data: {
            status: "RESOLVED",
            resolvedAt: new Date(),
            updates: {
              create: {
                authorId: req.user.id,
                status: "RESOLVED",
                message: `Move-out confirmed for ${actualMoveOutDate.toISOString().slice(0, 10)}.`,
              },
            },
          },
          include: includeRequest,
        });
        return { request: updatedRequest, settlement };
      },
      { isolationLevel: "Serializable" },
    );
    return res.json({
      success: true,
      data: {
        request: publicRequest(result.request),
        settlement: result.settlement,
      },
    });
  } catch (error) {
    if (error.code === "P2034")
      return res
        .status(409)
        .json({
          success: false,
          message:
            "Rental financial data changed during settlement. Refresh and retry.",
        });
    if (
      [
        "MOVING_REQUEST_NOT_FOUND",
        "MOVING_REQUEST_NOT_APPROVED",
        "INVALID_MOVE_OUT_DATE",
      ].includes(error.message)
    )
      return res
        .status(409)
        .json({
          success: false,
          message:
            error.message === "INVALID_MOVE_OUT_DATE"
              ? "Move-out date cannot be before move-in."
              : "An approved moving-out request is required.",
        });
    console.error("Confirm move-out error:", error);
    return res
      .status(500)
      .json({
        success: false,
        message: "Failed to confirm move-out and create settlement.",
      });
  }
}

export async function markUnitReady(req, res) {
  try {
    const rental = await prisma.rental.findUnique({
      where: { id: req.params.rentalId },
      select: { unitId: true, status: true },
    });
    if (!rental || rental.status !== "ENDED")
      return res
        .status(409)
        .json({
          success: false,
          message: "Only an ended rental can have its unit marked ready.",
        });
    await prisma.unit.update({
      where: { id: rental.unitId },
      data: { status: "AVAILABLE" },
    });
    return res.json({ success: true, message: "Unit marked available." });
  } catch (error) {
    console.error("Mark unit ready error:", error);
    return res
      .status(500)
      .json({ success: false, message: "Failed to mark unit ready." });
  }
}

export async function recordSettlementRefund(req, res) {
  try {
    const amount = Number(req.body.amount);
    const note = typeof req.body.note === "string" ? req.body.note.trim() : "";
    if (
      !Number.isFinite(amount) ||
      amount <= 0 ||
      Math.round(amount * 100) !== amount * 100 ||
      note.length > 500
    )
      return res
        .status(400)
        .json({
          success: false,
          message: "Enter a valid refund amount and note.",
        });
    const result = await prisma.$transaction(
      async (tx) => {
        const settlement = await tx.finalSettlement.findUnique({
          where: { id: req.params.id },
          include: {
            refunds: true,
            adjustments: true,
            rental: { include: { credit: true } },
          },
        });
        if (!settlement) throw new Error("SETTLEMENT_NOT_FOUND");
        const paidCents = settlement.refunds.reduce(
          (sum, refund) => sum + Math.round(Number(refund.amount) * 100),
          0,
        );
        const adjustedBalanceCents =
          Math.round(Number(settlement.originalBalance) * 100) +
          settlement.adjustments.reduce(
            (sum, item) => sum + Math.round(Number(item.amount) * 100),
            0,
          );
        const dueCents = Math.max(0, -adjustedBalanceCents);
        const amountCents = Math.round(amount * 100);
        if (paidCents + amountCents > dueCents)
          throw new Error("REFUND_EXCEEDS_DUE");
        const refund = await tx.settlementRefund.create({
          data: {
            settlementId: settlement.id,
            amount,
            note: note || null,
            recordedById: req.user.id,
          },
        });
        const previousRefundCents = paidCents;
        const creditRefundDueCents = Math.round(
          Number(settlement.tenantCreditRefund) * 100,
        );
        const creditRefundCents = Math.max(
          0,
          Math.min(previousRefundCents + amountCents, creditRefundDueCents) -
            Math.min(previousRefundCents, creditRefundDueCents),
        );
        if (creditRefundCents && settlement.rental.credit) {
          await tx.tenantCredit.update({
            where: { rentalId: settlement.rentalId },
            data: { balance: { decrement: creditRefundCents / 100 } },
          });
          await tx.creditTransaction.create({
            data: {
              tenantCreditId: settlement.rental.credit.id,
              type: "REFUND",
              amount: creditRefundCents / 100,
              recordedById: req.user.id,
              notes: `Refund for final settlement ${settlement.id}`,
            },
          });
        }
        return refund;
      },
      { isolationLevel: "Serializable" },
    );
    return res.status(201).json({ success: true, data: result });
  } catch (error) {
    if (error.message === "SETTLEMENT_NOT_FOUND")
      return res
        .status(404)
        .json({ success: false, message: "Settlement not found." });
    if (error.message === "REFUND_EXCEEDS_DUE")
      return res
        .status(409)
        .json({
          success: false,
          message: "Refund cannot exceed the remaining refund due.",
        });
    console.error("Record settlement refund error:", error);
    return res
      .status(500)
      .json({ success: false, message: "Failed to record refund." });
  }
}

export async function recordSettlementAdjustment(req, res) {
  try {
    const amount = Number(req.body.amount);
    const reason =
      typeof req.body.reason === "string" ? req.body.reason.trim() : "";
    if (
      !Number.isFinite(amount) ||
      amount === 0 ||
      Math.round(amount * 100) !== amount * 100 ||
      !reason ||
      reason.length > 500
    )
      return res
        .status(400)
        .json({
          success: false,
          message:
            "Enter a non-zero adjustment amount and a reason of 500 characters or fewer.",
        });
    const adjustment = await prisma.settlementAdjustment.create({
      data: {
        settlementId: req.params.id,
        amount,
        reason,
        recordedById: req.user.id,
      },
    });
    return res.status(201).json({ success: true, data: adjustment });
  } catch (error) {
    if (error.code === "P2003")
      return res
        .status(404)
        .json({ success: false, message: "Settlement not found." });
    console.error("Record settlement adjustment error:", error);
    return res
      .status(500)
      .json({
        success: false,
        message: "Failed to record settlement adjustment.",
      });
  }
}
