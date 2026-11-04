import prisma from "../config/prisma.js";
import { ensureMonthlyDues } from "./payment.controller.js";

const dateOnly = (value) => value?.toISOString().slice(0, 10) ?? null;

export async function getTenantDashboard(req, res) {
  try {
    const [user, rental] = await Promise.all([
      prisma.user.findUnique({ where: { id: req.user.id }, include: { profile: true } }),
      prisma.rental.findFirst({
        where: { tenant: { userId: req.user.id }, status: { in: ["ACTIVE", "ON_LEAVING"] } },
        orderBy: { createdAt: "desc" },
        include: { unit: true, monthlyDues: { orderBy: { dueDate: "asc" } } },
      }),
    ]);
    if (rental) await ensureMonthlyDues(rental);
    if (rental) {
      rental.monthlyDues = await prisma.monthlyDue.findMany({
        where: { rentalId: rental.id }, orderBy: [{ dueDate: "asc" }, { billingPeriod: "asc" }],
      });
    }
    if (!rental) {
      return res.json({ success: true, data: { tenantName: user?.profile?.fullName ?? user?.username ?? "Tenant", rental: null, totalDue: "0.00", nextDueDate: null, requests: [], payments: [] } });
    }
    const [requests, requestCount, payments] = await Promise.all([
      prisma.tenantRequest.findMany({ where: { rentalId: rental.id }, orderBy: { createdAt: "desc" }, take: 3 }),
      prisma.tenantRequest.count({ where: { rentalId: rental.id } }),
      prisma.payment.findMany({ where: { rentalId: rental.id }, orderBy: [{ paymentDate: "desc" }, { createdAt: "desc" }], take: 3 }),
    ]);
    const unpaid = rental.monthlyDues.filter((due) => Number(due.balance) > 0);
    return res.json({
      success: true,
      data: {
        tenantName: user?.profile?.fullName ?? user?.username ?? "Tenant",
        rental: { id: rental.id, status: rental.status, monthlyRent: rental.monthlyRent.toString(), moveInDate: dateOnly(rental.moveInDate), unitNumber: rental.unit.unitNumber },
        totalDue: unpaid.reduce((sum, due) => sum + Number(due.balance), 0).toFixed(2),
        nextDueDate: dateOnly(unpaid[0]?.dueDate),
        requestCount,
        requests: requests.map((item) => ({ id: item.id, title: item.title, category: item.category, status: item.status, createdAt: item.createdAt })),
        payments: payments.map((item) => ({ id: item.id, reference: item.reference, amount: item.amount.toString(), date: dateOnly(item.paymentDate) })),
      },
    });
  } catch (error) {
    console.error("Get tenant dashboard error:", error);
    return res.status(500).json({ success: false, message: "Failed to load dashboard." });
  }
}

