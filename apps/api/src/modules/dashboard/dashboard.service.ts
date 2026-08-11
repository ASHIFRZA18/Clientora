import type { Role } from "@prisma/client";
import { dashboardRepository, type Scope } from "./dashboard.repository.js";

function startOfMonth(offset = 0) {
  const d = new Date();
  d.setDate(1);
  d.setHours(0, 0, 0, 0);
  d.setMonth(d.getMonth() + offset);
  return d;
}

function percentChange(current: number, previous: number): number | null {
  if (previous === 0) return current > 0 ? 100 : null;
  return Math.round(((current - previous) / previous) * 100);
}

/** Sales Executives see only their own book of business; Managers and Admins see the whole org. */
function scopeFor(userId: string, role: Role): Scope {
  return role === "SALES_EXECUTIVE" ? { ownerId: userId } : {};
}

export const dashboardService = {
  async getOverview(userId: string, role: Role) {
    const scope = scopeFor(userId, role);

    const thisMonthStart = startOfMonth(0);
    const nextMonthStart = startOfMonth(1);
    const lastMonthStart = startOfMonth(-1);

    const [
      revenueThisMonth,
      revenueLastMonth,
      customersNow,
      customersLastMonth,
      leadsThisMonth,
      leadsLastMonth,
      dealsWonThisMonth,
      dealsWonLastMonth,
      revenueTrend,
      customerGrowth,
      funnel,
      recentDeals,
      tasksToday,
      activity,
    ] = await Promise.all([
      dashboardRepository.sumWonDealsBetween(scope, thisMonthStart, nextMonthStart),
      dashboardRepository.sumWonDealsBetween(scope, lastMonthStart, thisMonthStart),
      dashboardRepository.countCustomersCreatedBefore(scope, nextMonthStart),
      dashboardRepository.countCustomersCreatedBefore(scope, thisMonthStart),
      dashboardRepository.countLeadsCreatedBetween(scope, thisMonthStart, nextMonthStart),
      dashboardRepository.countLeadsCreatedBetween(scope, lastMonthStart, thisMonthStart),
      dashboardRepository.countDealsWonBetween(scope, thisMonthStart, nextMonthStart),
      dashboardRepository.countDealsWonBetween(scope, lastMonthStart, thisMonthStart),
      dashboardRepository.revenueTrend(scope, 6),
      dashboardRepository.customerGrowth(scope, 6),
      dashboardRepository.funnel(scope),
      dashboardRepository.recentDeals(scope, 6),
      dashboardRepository.tasksDueToday(userId),
      dashboardRepository.recentActivity(scope, 8),
    ]);

    return {
      stats: {
        revenue: { value: revenueThisMonth, changePct: percentChange(revenueThisMonth, revenueLastMonth) },
        customers: { value: customersNow, changePct: percentChange(customersNow, customersLastMonth) },
        leads: { value: leadsThisMonth, changePct: percentChange(leadsThisMonth, leadsLastMonth) },
        dealsWon: { value: dealsWonThisMonth, changePct: percentChange(dealsWonThisMonth, dealsWonLastMonth) },
      },
      revenueTrend,
      customerGrowth,
      funnel,
      recentDeals: recentDeals.map((d: any) => ({
        id: d.id,
        title: d.title,
        customerName: d.customer?.name ?? d.customer?.company ?? "Unknown",
        value: Number(d.value),
        currency: d.currency,
        stage: d.stage,
        updatedAt: d.updatedAt,
      })),
      tasksToday: tasksToday.map((t: any) => ({
        id: t.id,
        title: t.title,
        dueDate: t.dueDate,
        priority: t.priority,
        status: t.status,
      })),
      activity: activity.map((a: any) => ({
        id: a.id,
        type: a.type,
        actorName: a.actor?.name ?? "System",
        relatedType: a.relatedType,
        relatedId: a.relatedId,
        createdAt: a.createdAt,
      })),
    };
  },
};
