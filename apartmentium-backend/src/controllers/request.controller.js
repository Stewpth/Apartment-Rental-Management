import { randomUUID } from "node:crypto";
import prisma from "../config/prisma.js";
import supabase, { requestAttachmentsBucket } from "../config/supabase.js";
import { ensureMonthlyDues } from "./payment.controller.js";
import {
  notifyRoleUsers,
  notifyUser,
} from "../services/notification.service.js";
import {
  includeRequest,
  isAfterTodayInManila,
  publicRequest,
  validDate,
} from "../services/request-data.js";

const imageTypes = new Set(["image/jpeg", "image/png"]);
const validCategories = new Set([
  "REPAIR",
  "PERMISSION",
  "COMPLAINT",
  "MOVING_OUT",
]);
const statusOrder = ["PENDING", "IN_PROGRESS", "RESOLVED", "REJECTED"];
const invalidMoveOutDateMessage =
  "Can't make request, make sure that your moving out date is tomorrow.";

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
      const { error } = await supabase.storage
        .from(requestAttachmentsBucket)
        .upload(storageKey, buffer, {
          contentType: file.mimeType,
          upsert: false,
        });
      if (error) throw error;
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
    await removeStoredAttachments(stored);
    throw error;
  }
}

async function removeStoredAttachments(files) {
  if (!files.length) return;
  const { error } = await supabase.storage
    .from(requestAttachmentsBucket)
    .remove(files.map((file) => file.storageKey));
  if (error) console.error("Unable to clean up request attachments:", error);
}

export async function createTenantRequest(req, res) {
  let stored = [];
  try {
    const category = String(req.body.category ?? "")
      .trim()
      .toUpperCase();
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
      return res.status(400).json({
        success: false,
        message: "Title is required and must be 120 characters or fewer.",
      });
    if (!description || description.length > 500)
      return res.status(400).json({
        success: false,
        message: "Description is required and must be 500 characters or fewer.",
      });
    if (
      (category === "REPAIR" || category === "COMPLAINT") &&
      attachments.length > 3
    )
      return res
        .status(400)
        .json({ success: false, message: "You can attach up to 3 images." });
    if (category !== "REPAIR" && category !== "COMPLAINT" && attachments.length)
      return res.status(400).json({
        success: false,
        message:
          "Attachments are only allowed for repair and complaint requests.",
      });
    if (
      category === "MOVING_OUT" &&
      !isAfterTodayInManila(req.body.requestedMoveOutDate)
    )
      return res.status(400).json({
        success: false,
        message: invalidMoveOutDateMessage,
      });
    if (category === "MOVING_OUT" && reason.length > 500)
      return res.status(400).json({
        success: false,
        message: "Reason must be 500 characters or fewer.",
      });

    const rental = await prisma.rental.findFirst({
      where: {
        tenant: { userId: req.user.id },
        status: { in: ["ACTIVE", "ON_LEAVING"] },
      },
      orderBy: { createdAt: "desc" },
    });
    if (!rental)
      return res.status(409).json({
        success: false,
        message: "An active rental is required to create a request.",
      });
    if (category === "MOVING_OUT") {
      const activeRequests = await prisma.tenantRequest.findMany({
        where: {
          rentalId: rental.id,
          category,
          status: { in: ["PENDING", "IN_PROGRESS"] },
        },
      });
      if (activeRequests.length > 0 || rental.status === "ON_LEAVING")
        return res.status(409).json({
          success: false,
          message: "A moving-out request is already active for this rental.",
        });
      // Recheck at the persistence boundary so midnight cannot make a stale
      // date valid while request validation and creation are in progress.
      if (!isAfterTodayInManila(req.body.requestedMoveOutDate))
        return res.status(400).json({
          success: false,
          message: invalidMoveOutDateMessage,
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
    const responseRequest = publicRequest(created);
    await notifyRoleUsers({
      role: "ADMIN",
      type: "REQUEST",
      title: "New tenant request",
      message: `${responseRequest.tenant.fullName}: ${created.title}`,
      link: `/admin/requests/${created.id}`,
    });
    return res.status(201).json({ success: true, data: responseRequest });
  } catch (error) {
    await removeStoredAttachments(stored);
    if (
      [
        "INVALID_ATTACHMENTS",
        "TOO_MANY_ATTACHMENTS",
        "INVALID_ATTACHMENT",
      ].includes(error.message)
    )
      return res.status(400).json({
        success: false,
        message:
          "Attachments must be up to 3 PNG or JPEG images, each no larger than 5 MB.",
      });
    if (error.code === "P2002")
      return res.status(409).json({
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
    const { data, error } = await supabase.storage
      .from(requestAttachmentsBucket)
      .download(attachment.storageKey);
    if (error || !data)
      return res
        .status(404)
        .json({ success: false, message: "Attachment not found." });
    const bytes = Buffer.from(await data.arrayBuffer());
    res.setHeader("Content-Type", attachment.mimeType);
    res.setHeader(
      "Content-Disposition",
      `inline; filename="${attachment.fileName.replace(/[\"\r\n]/g, "_")}"`,
    );
    res.setHeader("Cache-Control", "private, no-store");
    return res.send(bytes);
  } catch (error) {
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
      include: {
        rental: { include: { tenant: { select: { userId: true } } } },
      },
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
      return res.status(400).json({
        success: false,
        message: "Admin notes must be 2,000 characters or fewer.",
      });
    if (
      status !== undefined &&
      !nextStatus(request.category, request.status, status)
    )
      return res.status(409).json({
        success: false,
        message: "That status transition is not allowed for this request.",
      });
    if (
      request.category === "MOVING_OUT" &&
      status === "IN_PROGRESS" &&
      request.rental.status !== "ACTIVE"
    )
      return res.status(409).json({
        success: false,
        message: "Only an active rental can be approved to move out.",
      });
    if (
      request.category === "MOVING_OUT" &&
      status === "IN_PROGRESS" &&
      !isAfterTodayInManila(
        request.requestedMoveOutDate?.toISOString().slice(0, 10),
      )
    )
      return res.status(409).json({
        success: false,
        message:
          "This requested move-out date has passed. Ask the tenant to submit a new request with a future date.",
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
    if (status || message) {
      const nextMessage =
        typeof message === "string" && message.trim()
          ? message.trim().slice(0, 2000)
          : status
            ? `Your request status is now ${status.toLowerCase().replaceAll("_", " ")}.`
            : "Your request has been updated.";
      await notifyUser({
        userId: request.rental.tenant.userId,
        type: "REQUEST_UPDATE",
        title: "Request update",
        message: `${request.title}: ${nextMessage}`,
        link: `/tenant/requests`,
      });
    }
    return res.json({ success: true, data: publicRequest(updated) });
  } catch (error) {
    if (error.code === "P2034")
      return res.status(409).json({
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
