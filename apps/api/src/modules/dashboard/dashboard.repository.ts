import { prisma } from "../../lib/prisma.js";

export interface Scope {
  /** When set, results are restricted to records owned/assigned to this user (Sales Executive view). */
  ownerId?: string;
}

function startOfMonth(offset = 0) {
  const d = new Date();
  d.setDate(1);
  d.setHours(0, 0, 0, 0);
  d.setMonth(d.getMonth() + offset);
  return d;
}

export const dashboardRepository = {
  async sumWonDealsBetween(scope: Scope, from: Date, to: Date) {
    const result = await prisma.deal.aggregate({
      _sum: { value: true },
      where: {
        stage: "WON",
        closedAt: { gte: from, lt: to },
        ...(scope.ownerId ? { ownerId: scope.ownerId } : {}),
      },
    });
    return Number(result._sum.value ?? 0);
  },

  async countCustomersCreatedBefore(scope: Scope, before: Date) {
    return prisma.customer.count({
      where: {
        createdAt: { lt: before },
        deletedAt: null,
        ...(scope.ownerId ? { ownerId: scope.ownerId } : {}),
      },
    });
  },

  async countLeadsCreatedBetween(scope: Scope, from: Date, to: Date) {
    return prisma.lead.count({
      where: {
        createdAt: { gte: from, lt: to },
        deletedAt: null,
        ...(scope.ownerId ? { assignedTo: scope.ownerId } : {}),
      },
    });
  },

  async countDealsWonBetween(scope: Scope, from: Date, to: Date) {
    return prisma.deal.count({
      where: {
        stage: "WON",
        closedAt: { gte: from, lt: to },
        ...(scope.ownerId ? { ownerId: scope.ownerId } : {}),
      },
    });
  },

  async revenueTrend(scope: Scope, months: number) {
    const points: { month: string; revenue: number }[] = [];
    for (let i = months - 1; i >= 0; i--) {
      const from = startOfMonth(-i);
      const to = startOfMonth(-i + 1);
      const revenue = await this.sumWonDealsBetween(scope, from, to);
      points.push({ month: from.toLocaleString("en-US", { month: "short" }), revenue });
    }
    return points;
  },

  async customerGrowth(scope: Scope, months: number) {
    const points: { month: string; total: number }[] = [];
    for (let i = months - 1; i >= 0; i--) {
      const before = startOfMonth(-i + 1);
      const total = await this.countCustomersCreatedBefore(scope, before);
      points.push({ month: before.toLocaleString("en-US", { month: "short" }), total });
    }
    return points;
  },

  async funnel(scope: Scope) {
    const grouped = await prisma.deal.groupBy({
      by: ["stage"],
      _count: { _all: true },
      where: {
        deletedAt: null,
        ...(scope.ownerId ? { ownerId: scope.ownerId } : {}),
      },
    });
    const map = new Map(grouped.map((g: any) => [g.stage, g._count._all]));
    const stageOrder = [
      "NEW_LEAD",
      "CONTACTED",
      "QUALIFIED",
      "PROPOSAL_SENT",
      "NEGOTIATION",
      "WON",
      "LOST",
    ];
    return stageOrder.map((stage) => ({ stage, count: map.get(stage) ?? 0 }));
  },

  async recentDeals(scope: Scope, limit: number) {
    return prisma.deal.findMany({
      where: { deletedAt: null, ...(scope.ownerId ? { ownerId: scope.ownerId } : {}) },
      orderBy: { updatedAt: "desc" },
      take: limit,
      include: { customer: { select: { name: true, company: true } } },
    });
  },

  async tasksDueToday(userId: string) {
    const start = new Date();
    start.setHours(0, 0, 0, 0);
    const end = new Date(start);
    end.setDate(end.getDate() + 1);

    return prisma.task.findMany({
      where: {
        assignedTo: userId,
        status: { not: "DONE" },
        dueDate: { gte: start, lt: end },
      },
      orderBy: { dueDate: "asc" },
    });
  },

  async recentActivity(scope: Scope, limit: number) {
    return prisma.activity.findMany({
      where: scope.ownerId ? { actorId: scope.ownerId } : {},
      orderBy: { createdAt: "desc" },
      take: limit,
      include: { actor: { select: { name: true } } },
    });
  },
};
