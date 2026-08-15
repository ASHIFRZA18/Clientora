import { prisma } from "../../lib/prisma.js";

export interface DateRange {
  from?: Date;
  to?: Date;
  ownerId?: string;
}

function dateWhere(field: string, range: DateRange) {
  if (!range.from && !range.to) return {};
  return {
    [field]: {
      ...(range.from ? { gte: range.from } : {}),
      ...(range.to ? { lte: range.to } : {}),
    },
  };
}

export const reportsRepository = {
  revenueDeals(range: DateRange) {
    return prisma.deal.findMany({
      where: {
        deletedAt: null,
        stage: "WON",
        ...dateWhere("closedAt", range),
        ...(range.ownerId ? { ownerId: range.ownerId } : {}),
      },
      orderBy: { closedAt: "desc" },
      include: {
        customer: { select: { id: true, name: true, company: true } },
        owner: { select: { id: true, name: true } },
      },
    });
  },

  leads(range: DateRange) {
    return prisma.lead.findMany({
      where: {
        deletedAt: null,
        ...dateWhere("createdAt", range),
        ...(range.ownerId ? { assignedTo: range.ownerId } : {}),
      },
      orderBy: { createdAt: "desc" },
      include: {
        customer: { select: { id: true, name: true, company: true } },
        assignee: { select: { id: true, name: true } },
      },
    });
  },

  customers(range: DateRange) {
    return prisma.customer.findMany({
      where: {
        deletedAt: null,
        ...dateWhere("createdAt", range),
        ...(range.ownerId ? { ownerId: range.ownerId } : {}),
      },
      orderBy: { createdAt: "desc" },
      include: {
        owner: { select: { id: true, name: true } },
        _count: { select: { leads: true, deals: true } },
      },
    });
  },

  /** Every non-admin user, for the performance report's per-rep breakdown. */
  salesUsers() {
    return prisma.user.findMany({
      where: { deletedAt: null, role: { in: ["SALES_EXECUTIVE", "SALES_MANAGER"] } },
      select: { id: true, name: true, role: true },
      orderBy: { name: "asc" },
    });
  },

  allDealsInRange(range: DateRange) {
    return prisma.deal.findMany({
      where: { deletedAt: null, ...dateWhere("createdAt", range) },
      select: { ownerId: true, stage: true, value: true },
    });
  },

  allLeadsInRange(range: DateRange) {
    return prisma.lead.findMany({
      where: { deletedAt: null, ...dateWhere("createdAt", range) },
      select: { assignedTo: true },
    });
  },

  allCustomersInRange(range: DateRange) {
    return prisma.customer.findMany({
      where: { deletedAt: null, ...dateWhere("createdAt", range) },
      select: { ownerId: true },
    });
  },
};
