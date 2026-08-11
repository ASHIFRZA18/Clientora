import { prisma } from "../../lib/prisma.js";
import type { CreateDealInput, UpdateDealInput, DealStage } from "./deals.validation.js";

export interface Scope {
  /** Sales Executives are restricted to deals they own. */
  ownerId?: string;
}

export const DEAL_STAGES: DealStage[] = [
  "NEW_LEAD",
  "CONTACTED",
  "QUALIFIED",
  "PROPOSAL_SENT",
  "NEGOTIATION",
  "WON",
  "LOST",
];

function scopeWhere(scope: Scope) {
  return scope.ownerId ? { ownerId: scope.ownerId } : {};
}

export const dealsRepository = {
  /** All deals for the board, grouped by stage and ordered by column position. */
  async board(scope: Scope) {
    const deals = await prisma.deal.findMany({
      where: { deletedAt: null, ...scopeWhere(scope) },
      orderBy: { order: "asc" },
      include: {
        customer: { select: { id: true, name: true, company: true } },
        owner: { select: { id: true, name: true } },
      },
    });

    const columns: Record<string, typeof deals> = {};
    for (const stage of DEAL_STAGES) columns[stage] = [];
    for (const deal of deals) columns[deal.stage].push(deal);
    return columns;
  },

  findById(scope: Scope, id: string) {
    return prisma.deal.findFirst({
      where: { id, deletedAt: null, ...scopeWhere(scope) },
      include: {
        customer: { select: { id: true, name: true, company: true } },
        owner: { select: { id: true, name: true } },
        lead: { select: { id: true, source: true } },
      },
    });
  },

  async create(data: CreateDealInput & { ownerId: string }) {
    const maxOrder = await prisma.deal.aggregate({
      where: { stage: data.stage, deletedAt: null },
      _max: { order: true },
    });
    return prisma.deal.create({
      data: {
        title: data.title,
        customerId: data.customerId,
        leadId: data.leadId || null,
        stage: data.stage,
        order: (maxOrder._max?.order ?? -1) + 1,
        value: data.value,
        currency: data.currency,
        ownerId: data.ownerId,
        expectedCloseDate: data.expectedCloseDate ?? null,
        closedAt: data.stage === "WON" || data.stage === "LOST" ? new Date() : null,
      },
    });
  },

  async update(scope: Scope, id: string, data: UpdateDealInput) {
    const existing = await prisma.deal.findFirst({ where: { id, deletedAt: null, ...scopeWhere(scope) } });
    if (!existing) return null;
    return prisma.deal.update({
      where: { id },
      data: {
        ...(data.title !== undefined ? { title: data.title } : {}),
        ...(data.value !== undefined ? { value: data.value } : {}),
        ...(data.currency !== undefined ? { currency: data.currency } : {}),
        ...(data.expectedCloseDate !== undefined ? { expectedCloseDate: data.expectedCloseDate } : {}),
        ...(data.ownerId !== undefined ? { ownerId: data.ownerId } : {}),
      },
    });
  },

  /**
   * Moves a deal to `toStage` at position `toIndex`, then re-sequences the
   * order field for every deal left in both the source and destination
   * columns so drag position always persists cleanly (no fractional-order drift).
   */
  async move(scope: Scope, id: string, toStage: DealStage, toIndex: number) {
    const deal = await prisma.deal.findFirst({ where: { id, deletedAt: null, ...scopeWhere(scope) } });
    if (!deal) return null;

    const fromStage = deal.stage as DealStage;
    const wasClosed = fromStage === "WON" || fromStage === "LOST";
    const willBeClosed = toStage === "WON" || toStage === "LOST";

    await prisma.deal.update({
      where: { id },
      data: {
        stage: toStage,
        ...(willBeClosed && !wasClosed ? { closedAt: new Date() } : {}),
        ...(!willBeClosed && wasClosed ? { closedAt: null } : {}),
      },
    });

    // Re-sequence destination column with the moved card inserted at toIndex.
    const destDeals = (
      await prisma.deal.findMany({
        where: { stage: toStage, deletedAt: null, ...scopeWhere(scope) },
        orderBy: { order: "asc" },
      })
    ).filter((d: { id: string }) => d.id !== id);

    destDeals.splice(Math.min(toIndex, destDeals.length), 0, { id } as any);
    await Promise.all(
      destDeals.map((d: { id: string }, i: number) => prisma.deal.update({ where: { id: d.id }, data: { order: i } }))
    );

    // If the card left a different column, close the gap it left behind.
    if (fromStage !== toStage) {
      const sourceDeals = await prisma.deal.findMany({
        where: { stage: fromStage, deletedAt: null, ...scopeWhere(scope) },
        orderBy: { order: "asc" },
      });
      await Promise.all(
        sourceDeals.map((d: { id: string }, i: number) => prisma.deal.update({ where: { id: d.id }, data: { order: i } }))
      );
    }

    return prisma.deal.findFirst({ where: { id } });
  },

  async softDelete(scope: Scope, id: string) {
    const existing = await prisma.deal.findFirst({ where: { id, deletedAt: null, ...scopeWhere(scope) } });
    if (!existing) return null;
    return prisma.deal.update({ where: { id }, data: { deletedAt: new Date() } });
  },

  logActivity(type: string, actorId: string, dealId: string, metadata?: Record<string, unknown>) {
    return prisma.activity.create({
      data: { type, actorId, relatedType: "DEAL", relatedId: dealId, metadata },
    });
  },
};
