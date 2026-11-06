import prisma from "../config/prisma.js";

const dateOnly = (value) => value?.toISOString().slice(0, 10) ?? null;
const tenantName = (rental) =>
  rental.tenant.user.profile?.fullName ?? rental.tenant.user.username;

export async function getAdminDashboard(req, res) {
  try {
    const today = new Date();
    today.setUTCHours(0, 0, 0, 0);
    const monthStart = new Date(
      Date.UTC(today.getUTCFullYear(), today.getUTCMonth(), 1),
    );
    const chartStart = new Date(
      Date.UTC(today.getUTCFullYear(), today.getUTCMonth() - 5, 1),
    );
    const [
      units,
      tenantCount,
      rentals,
      payments,
      dues,
      requests,
      chartPayments,
    ] = await Promise.all([
      prisma.unit.findMany({
        select: { id: true, unitNumber: true, status: true },
      }),
      prisma.tenant.count(),
      prisma.rental.findMany({
        where: { status: { in: ["ACTIVE", "ON_LEAVING"] } },
        orderBy: { createdAt: "desc" },
        take: 5,
        include: {
          tenant: { include: { user: { include: { profile: true } } } },
          unit: true,
        },
      }),
      prisma.payment.findMany({
        orderBy: [{ paymentDate: "desc" }, { createdAt: "desc" }],
        take: 5,
        include: {
          rental: {
            include: {
              tenant: { include: { user: { include: { profile: true } } } },
              unit: true,
            },
          },
        },
      }),
      prisma.monthlyDue.findMany({
        where: { balance: { gt: 0 }, dueDate: { gte: today } },
        orderBy: { dueDate: "asc" },
        take: 5,
        include: {
          rental: {
            include: {
              tenant: { include: { user: { include: { profile: true } } } },
              unit: true,
            },
          },
        },
      }),
      prisma.tenantRequest.findMany({
        orderBy: { createdAt: "desc" },
        take: 5,
        include: {
          rental: {
            include: {
              tenant: { include: { user: { include: { profile: true } } } },
              unit: true,
            },
          },
        },
      }),
      prisma.payment.findMany({
        where: { paymentDate: { gte: chartStart } },
        select: { paymentDate: true, amount: true },
      }),
    ]);

    const chart = Array.from({ length: 6 }, (_, index) => {
      const date = new Date(
        Date.UTC(today.getUTCFullYear(), today.getUTCMonth() - 5 + index, 1),
      );
      const year = date.getUTCFullYear();
      const month = date.getUTCMonth();
      return {
        month: new Intl.DateTimeFormat("en", {
          month: "short",
          timeZone: "UTC",
        }).format(date),
        collected: chartPayments
          .filter(
            (item) =>
              item.paymentDate.getUTCFullYear() === year &&
              item.paymentDate.getUTCMonth() === month,
          )
          .reduce((sum, item) => sum + Number(item.amount), 0),
      };
    });

    const statusCounts = { OCCUPIED: 0, AVAILABLE: 0, MAINTENANCE: 0 };
    for (const unit of units)
      statusCounts[unit.status] = (statusCounts[unit.status] ?? 0) + 1;
    const activities = [
      ...payments.map((payment) => ({
        id: `payment-${payment.id}`,
        type: "payment",
        title: "Payment received",
        detail: `${payment.rental.unit.unitNumber} · ₱${Number(payment.amount).toLocaleString("en-PH")}`,
        date: dateOnly(payment.paymentDate),
        path: `/admin/payments/${payment.rentalId}`,
      })),
      ...requests.map((request) => ({
        id: `request-${request.id}`,
        type: "request",
        title: request.title,
        detail: `${tenantName(request.rental)} · ${request.rental.unit.unitNumber}`,
        date: dateOnly(request.createdAt),
        path: `/admin/requests/${request.id}`,
      })),
      ...rentals.map((rental) => ({
        id: `rental-${rental.id}`,
        type: "tenant",
        title: "Rental created",
        detail: `${tenantName(rental)} · ${rental.unit.unitNumber}`,
        date: dateOnly(rental.createdAt),
        path: "/admin/rentals",
      })),
    ]
      .sort((a, b) => b.date.localeCompare(a.date))
      .slice(0, 5);

    return res.json({
      success: true,
      data: {
        summary: {
          tenants: tenantCount,
          units: units.length,
          occupied: statusCounts.OCCUPIED,
          paymentsThisMonth: await prisma.payment.count({
            where: { paymentDate: { gte: monthStart } },
          }),
          openRequests: await prisma.tenantRequest.count({
            where: { status: { in: ["PENDING", "IN_PROGRESS"] } },
          }),
        },
        unitStatuses: statusCounts,
        chart,
        recentTenants: rentals.map((rental) => ({
          id: rental.id,
          unitId: rental.unit.id,
          name: tenantName(rental),
          unit: rental.unit.unitNumber,
          status: rental.status,
          moveInDate: dateOnly(rental.moveInDate),
        })),
        upcomingEvents: dues.map((due) => ({
          id: due.id,
          title: "Rent due",
          detail: `${due.rental.unit.unitNumber} · ${tenantName(due.rental)}`,
          amount: Number(due.balance),
          dueDate: dateOnly(due.dueDate),
          path: `/admin/payments/${due.rentalId}`,
        })),
        activities,
      },
    });
  } catch (error) {
    console.error("Get admin dashboard error:", error);
    return res
      .status(500)
      .json({ success: false, message: "Failed to load dashboard." });
  }
}

export async function getAdminDashboardActivities(req, res) {
  try {
    const requestedPage = Number.parseInt(req.query.page, 10);
    const pageSize = 10;
    const page =
      Number.isInteger(requestedPage) && requestedPage > 0 ? requestedPage : 1;
    const [paymentCount, requestCount, rentalCount] = await Promise.all([
      prisma.payment.count(),
      prisma.tenantRequest.count(),
      prisma.rental.count(),
    ]);
    const total = paymentCount + requestCount + rentalCount;
    const totalPages = Math.ceil(total / pageSize);
    const currentPage = totalPages ? Math.min(page, totalPages) : 1;
    const candidateLimit = currentPage * pageSize;
    const [payments, requests, rentals] = await Promise.all([
      prisma.payment.findMany({
        orderBy: [{ paymentDate: "desc" }, { createdAt: "desc" }],
        take: candidateLimit,
        include: {
          rental: {
            include: {
              tenant: { include: { user: { include: { profile: true } } } },
              unit: true,
            },
          },
        },
      }),
      prisma.tenantRequest.findMany({
        orderBy: { createdAt: "desc" },
        take: candidateLimit,
        include: {
          rental: {
            include: {
              tenant: { include: { user: { include: { profile: true } } } },
              unit: true,
            },
          },
        },
      }),
      prisma.rental.findMany({
        orderBy: { createdAt: "desc" },
        take: candidateLimit,
        include: {
          tenant: { include: { user: { include: { profile: true } } } },
          unit: true,
        },
      }),
    ]);
    const activities = [
      ...payments.map((payment) => ({
        id: `payment-${payment.id}`,
        type: "payment",
        title: "Payment received",
        detail: `${payment.rental.unit.unitNumber} · ₱${Number(payment.amount).toLocaleString("en-PH")}`,
        date: dateOnly(payment.paymentDate),
        sortAt: payment.paymentDate.getTime(),
        path: `/admin/payments/${payment.rentalId}`,
      })),
      ...requests.map((request) => ({
        id: `request-${request.id}`,
        type: "request",
        title: request.title,
        detail: `${tenantName(request.rental)} · ${request.rental.unit.unitNumber}`,
        date: dateOnly(request.createdAt),
        sortAt: request.createdAt.getTime(),
        path: `/admin/requests/${request.id}`,
      })),
      ...rentals.map((rental) => ({
        id: `rental-${rental.id}`,
        type: "tenant",
        title: "Rental created",
        detail: `${tenantName(rental)} · ${rental.unit.unitNumber}`,
        date: dateOnly(rental.createdAt),
        sortAt: rental.createdAt.getTime(),
        path: "/admin/rentals",
      })),
    ].sort((left, right) => right.sortAt - left.sortAt);
    const offset = (currentPage - 1) * pageSize;
    return res.json({
      success: true,
      data: {
        activities: activities
          .slice(offset, offset + pageSize)
          .map(({ sortAt, ...activity }) => activity),
        page: currentPage,
        pageSize,
        total,
        totalPages,
      },
    });
  } catch (error) {
    console.error("Get admin dashboard activities error:", error);
    return res
      .status(500)
      .json({ success: false, message: "Failed to load activities." });
  }
}
