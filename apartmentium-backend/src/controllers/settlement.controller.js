import prisma from "../config/prisma.js";
import { includeRequest, publicRequest, validDate } from "../services/request-data.js";

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
