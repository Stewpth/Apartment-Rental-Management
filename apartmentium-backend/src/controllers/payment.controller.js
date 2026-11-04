import { randomUUID } from "node:crypto";
import prisma from "../config/prisma.js";

const PAYMENT_RENTAL_STATUSES = ["ACTIVE", "ON_LEAVING", "ENDED"];

function dateOnly(date) {
  return date ? new Date(date).toISOString().slice(0, 10) : null;
}

function dueDateForPeriod(moveInDate, year, month) {
  const day = new Date(moveInDate).getUTCDate();
  const dueYear = month === 11 ? year + 1 : year;
  const dueMonth = (month + 1) % 12;
  const lastDay = new Date(Date.UTC(dueYear, dueMonth + 1, 0)).getUTCDate();
  return new Date(Date.UTC(dueYear, dueMonth, Math.min(day, lastDay)));
}

export async function ensureMonthlyDues(rental) {
  if (rental.status !== "ACTIVE") return;
  const moveInDate = new Date(rental.moveInDate);
  const now = new Date();
  if (moveInDate > now) return;

  const startYear = moveInDate.getUTCFullYear();
  const startMonth = moveInDate.getUTCMonth();
  const endYear = now.getUTCFullYear();
  const endMonth = now.getUTCMonth();
  const operations = [];

  for (
    let year = startYear, month = startMonth;
    year < endYear || (year === endYear && month <= endMonth);
    month += 1
  ) {
    if (month > 11) {
      year += 1;
      month = 0;
    }
    const billingPeriod = new Date(Date.UTC(year, month, 1));
    operations.push(
      prisma.monthlyDue.upsert({
        where: {
          rentalId_billingPeriod: { rentalId: rental.id, billingPeriod },
        },
        create: {
          rentalId: rental.id,
          billingPeriod,
          dueDate: dueDateForPeriod(moveInDate, year, month),
          amountDue: rental.monthlyRent,
          amountPaid: 0,
          balance: rental.monthlyRent,
          status: "UNPAID",
        },
        update: { dueDate: dueDateForPeriod(moveInDate, year, month) },
      }),
    );
  }

  await Promise.all(operations);
}

async function findPaymentRental(rentalId) {
  return prisma.rental.findFirst({
    where: { id: rentalId, status: { in: PAYMENT_RENTAL_STATUSES } },
    include: {
      unit: true,
      tenant: { include: { user: { include: { profile: true } } } },
    },
  });
}

function tenantSummary(rental) {
  const profile = rental.tenant.user.profile;
  return {
    id: rental.tenant.id,
    fullName: profile?.fullName ?? rental.tenant.user.username,
    email: rental.tenant.user.email,
    phone: profile?.phone ?? null,
  };
}

function unitSummary(rental) {
  return {
    id: rental.unit.id,
    unitNumber: rental.unit.unitNumber,
    description: rental.unit.description,
  };
}

function summarizeDues(dues) {
  const unpaid = dues.filter((due) => Number(due.balance) > 0);
  const totalDue = unpaid.reduce((sum, due) => sum + Number(due.balance), 0);
  const dueDate =
    unpaid.map((due) => due.dueDate).sort((left, right) => left - right)[0] ??
    null;
  return { totalDue: totalDue.toFixed(2), dueDate: dateOnly(dueDate) };
}

async function getRentalWithCurrentDues(where) {
  const rentals = await prisma.rental.findMany({
    where: { ...where, status: { in: PAYMENT_RENTAL_STATUSES } },
    orderBy: { createdAt: "desc" },
    select: { id: true, moveInDate: true, monthlyRent: true, status: true },
  });
  await Promise.all(rentals.map(ensureMonthlyDues));
  return rentals;
}

export async function getPaymentRecords(req, res) {
  try {
    await getRentalWithCurrentDues({});
    const rentals = await prisma.rental.findMany({
      where: { status: { in: PAYMENT_RENTAL_STATUSES } },
      orderBy: { createdAt: "desc" },
      include: {
        unit: true,
        tenant: { include: { user: { include: { profile: true } } } },
        monthlyDues: { orderBy: { billingPeriod: "asc" } },
      },
    });

    const data = rentals.map((rental) => ({
      rentalId: rental.id,
      tenant: tenantSummary(rental),
      unit: unitSummary(rental),
      monthlyRent: rental.monthlyRent.toString(),
      ...summarizeDues(rental.monthlyDues),
    }));
    return res.status(200).json({ success: true, count: data.length, data });
  } catch (error) {
    console.error("Get payment records error:", error);
    return res
      .status(500)
      .json({ success: false, message: "Failed to retrieve payment records." });
  }
}

export async function getPaymentDetails(req, res) {
  try {
    const rental = await findPaymentRental(req.params.rentalId);
    if (!rental) {
      return res
        .status(404)
        .json({ success: false, message: "Payment record not found." });
    }
    await ensureMonthlyDues(rental);

    const [dues, payments] = await Promise.all([
      prisma.monthlyDue.findMany({
        where: { rentalId: rental.id },
        orderBy: { billingPeriod: "desc" },
      }),
      prisma.payment.findMany({
        where: { rentalId: rental.id },
        orderBy: [{ paymentDate: "desc" }, { createdAt: "desc" }],
      }),
    ]);

    const summary = summarizeDues(dues);
    return res.status(200).json({
      success: true,
      data: {
        rentalId: rental.id,
        tenant: tenantSummary(rental),
        unit: unitSummary(rental),
        monthlyRent: rental.monthlyRent.toString(),
        ...summary,
        dues: dues.map((due) => ({
          id: due.id,
          billingPeriod: dateOnly(due.billingPeriod),
          dueDate: dateOnly(due.dueDate),
          amountDue: due.amountDue.toString(),
          amountPaid: due.amountPaid.toString(),
          balance: due.balance.toString(),
          status: due.status,
        })),
        payments: payments.map((payment) => ({
          id: payment.id,
          date: dateOnly(payment.paymentDate),
          amount: payment.amount.toString(),
          reference: payment.reference,
          note: payment.note,
        })),
      },
    });
  } catch (error) {
    console.error("Get payment details error:", error);
    return res
      .status(500)
      .json({ success: false, message: "Failed to retrieve payment details." });
  }
}

export async function recordPayment(req, res) {
  try {
    const amount = Number(req.body.amount);
    const note = typeof req.body.note === "string" ? req.body.note.trim() : "";
    if (
      !Number.isFinite(amount) ||
      amount <= 0 ||
      Math.abs(amount * 100 - Math.round(amount * 100)) > 0.00001
    ) {
      return res
        .status(400)
        .json({
          success: false,
          message:
            "Enter a valid payment amount with up to two decimal places.",
        });
    }
    if (note.length > 50) {
      return res
        .status(400)
        .json({
          success: false,
          message: "Payment notes must be 50 characters or fewer.",
        });
    }

    const rental = await findPaymentRental(req.params.rentalId);
    if (!rental) {
      return res
        .status(404)
        .json({ success: false, message: "Payment record not found." });
    }
    await ensureMonthlyDues(rental);

    const amountCents = Math.round(amount * 100);
    const payment = await prisma.$transaction(
      async (tx) => {
        const dues = await tx.monthlyDue.findMany({
          where: { rentalId: rental.id, balance: { gt: 0 } },
          orderBy: [{ billingPeriod: "asc" }, { dueDate: "asc" }],
        });
        const totalDueCents = dues.reduce(
          (sum, due) => sum + Math.round(Number(due.balance) * 100),
          0,
        );
        if (amountCents > totalDueCents)
          throw new Error("PAYMENT_EXCEEDS_BALANCE");

        const createdPayment = await tx.payment.create({
          data: {
            rentalId: rental.id,
            amount,
            paymentDate: new Date(),
            reference: `PAY-${Date.now()}-${randomUUID().slice(0, 8)}`,
            note: note || null,
            recordedById: req.user.id,
          },
        });

        let remainingCents = amountCents;
        for (const due of dues) {
          if (remainingCents <= 0) break;
          const dueBalanceCents = Math.round(Number(due.balance) * 100);
          const allocatedCents = Math.min(remainingCents, dueBalanceCents);
          const amountPaid =
            Math.round(Number(due.amountPaid) * 100) + allocatedCents;
          const balance = dueBalanceCents - allocatedCents;
          await tx.paymentAllocation.create({
            data: {
              paymentId: createdPayment.id,
              monthlyDueId: due.id,
              amount: allocatedCents / 100,
            },
          });
          await tx.monthlyDue.update({
            where: { id: due.id },
            data: {
              amountPaid: amountPaid / 100,
              balance: balance / 100,
              status: balance === 0 ? "PAID" : "PARTIAL",
            },
          });
          remainingCents -= allocatedCents;
        }
        return createdPayment;
      },
      { isolationLevel: "Serializable" },
    );

    return res.status(201).json({
      success: true,
      message: "Payment recorded successfully.",
      data: {
        id: payment.id,
        reference: payment.reference,
        amount: payment.amount.toString(),
        paymentDate: dateOnly(payment.paymentDate),
        note: payment.note,
      },
    });
  } catch (error) {
    if (error.code === "P2034")
      return res
        .status(409)
        .json({
          success: false,
          message:
            "The outstanding balance changed. Refresh and record the payment again.",
        });
    if (error.message === "PAYMENT_EXCEEDS_BALANCE") {
      return res
        .status(409)
        .json({
          success: false,
          message: "Payment cannot exceed the outstanding balance.",
        });
    }
    console.error("Record payment error:", error);
    return res
      .status(500)
      .json({ success: false, message: "Failed to record payment." });
  }
}

export async function getMyPayments(req, res) {
  try {
    const rentalRef = await getRentalWithCurrentDues({
      tenant: { userId: req.user.id },
    });
    const rental = rentalRef[0]
      ? await findPaymentRental(rentalRef[0].id)
      : null;
    if (!rental) return res.status(200).json({ success: true, data: null });

    const [dues, payments] = await Promise.all([
      prisma.monthlyDue.findMany({
        where: { rentalId: rental.id },
        orderBy: { billingPeriod: "desc" },
      }),
      prisma.payment.findMany({
        where: { rentalId: rental.id },
        orderBy: [{ paymentDate: "desc" }, { createdAt: "desc" }],
        include: {
          allocations: {
            include: { monthlyDue: { select: { billingPeriod: true } } },
          },
        },
      }),
    ]);
    const summary = summarizeDues(dues);
    const now = new Date();
    const currentPeriod = new Date(
      Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), 1),
    );
    const currentDue = dues.find(
      (due) =>
        new Date(due.billingPeriod).getTime() === currentPeriod.getTime(),
    );

    return res.status(200).json({
      success: true,
      data: {
        rental: {
          id: rental.id,
          tenant: tenantSummary(rental),
          unit: unitSummary(rental),
          monthlyRent: rental.monthlyRent.toString(),
        },
        summary: {
          totalDue: summary.totalDue,
          nextDueDate: summary.dueDate,
          currentMonthDue: currentDue?.balance.toString() ?? "0.00",
          currentMonthDueDate: currentDue ? dateOnly(currentDue.dueDate) : null,
          currentMonthStatus: currentDue?.status ?? "PAID",
          lastPayment: payments[0]
            ? {
                amount: payments[0].amount.toString(),
                date: dateOnly(payments[0].paymentDate),
              }
            : null,
        },
        dues: dues.map((due) => ({
          id: due.id,
          billingPeriod: dateOnly(due.billingPeriod),
          dueDate: dateOnly(due.dueDate),
          balance: due.balance.toString(),
          status: due.status,
        })),
        payments: payments.map((payment) => ({
          id: payment.id,
          date: dateOnly(payment.paymentDate),
          amount: payment.amount.toString(),
          reference: payment.reference,
          note: payment.note,
          billingPeriods: [
            ...new Set(
              payment.allocations.map((allocation) =>
                dateOnly(allocation.monthlyDue.billingPeriod),
              ),
            ),
          ],
          status: "PAID",
        })),
      },
    });
  } catch (error) {
    console.error("Get tenant payments error:", error);
    return res
      .status(500)
      .json({ success: false, message: "Failed to retrieve your payments." });
  }
}
