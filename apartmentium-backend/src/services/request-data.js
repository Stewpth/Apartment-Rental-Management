// Shared request validation, response shaping, and Prisma include definition.
export function validDate(value) {
  if (typeof value !== "string" || !/^\d{4}-\d{2}-\d{2}$/.test(value))
    return null;
  const date = new Date(`${value}T00:00:00.000Z`);
  return Number.isNaN(date.getTime()) ||
    date.toISOString().slice(0, 10) !== value
    ? null
    : date;
}

export function publicRequest(request) {
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

export const includeRequest = {
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
