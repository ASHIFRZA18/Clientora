import { prisma } from "../../lib/prisma.js";
import type { ListLeadsQuery, CreateLeadInput, UpdateLeadInput } from "./leads.validation.js";

export interface Scope {
  /** Sales Executives are restricted to leads assigned to them. */
  assigneeId?: string;
}

function scopeWhere(scope: Scope) {
  return scope.assigneeId ? { assignedTo: scope.assigneeId } : {};
}

export const leadsRepository = {
  async list(scope: Scope, query: ListLeadsQuery) {
    const where: Record<string, unknown> = {
      deletedAt: null,
      ...scopeWhere(scope),
      ...(query.status ? { status: query.status } : {}),
      ...(query.unassigned ? { assignedTo: null } : {}),
      ...(query.assignedTo && !scope.assigneeId ? { assignedTo: query.assignedTo } : {}),
      ...(query.search
        ? {
            OR: [
              { source: { contains: query.search, mode: "insensitive" as const } },
              { customer: { name: { contains: query.search, mode: "insensitive" as const } } },
              { customer: { company: { contains: query.search, mode: "insensitive" as const } } },
            ],
          }
        : {}),
    };

    const [items, total] = await Promise.all([
      prisma.lead.findMany({
        where,
        orderBy: { [query.sortBy]: query.sortDir },
        skip: (query.page - 1) * query.pageSize,
        take: query.pageSize,
        include: {
          customer: { select: { id: true, name: true, company: true } },
          assignee: { select: { id: true, name: true } },
        },
      }),
      prisma.lead.count({ where }),
    ]);

    return { items, total };
  },

  findById(scope: Scope, id: string) {
    return prisma.lead.findFirst({
      where: { id, deletedAt: null, ...scopeWhere(scope) },
      include: {
        customer: { select: { id: true, name: true, company: true } },
        assignee: { select: { id: true, name: true } },
        deals: { orderBy: { createdAt: "desc" }, take: 5 },
      },
    });
  },

  create(data: CreateLeadInput) {
    return prisma.lead.create({
      data: {
        customerId: data.customerId,
        source: data.source || null,
        status: data.status,
        score: data.score,
        assignedTo: data.assignedTo || null,
      },
    });
  },

  async update(scope: Scope, id: string, data: UpdateLeadInput) {
    const existing = await prisma.lead.findFirst({ where: { id, deletedAt: null, ...scopeWhere(scope) } });
    if (!existing) return null;
    return prisma.lead.update({
      where: { id },
      data: {
        ...(data.source !== undefined ? { source: data.source || null } : {}),
        ...(data.status !== undefined ? { status: data.status } : {}),
        ...(data.score !== undefined ? { score: data.score } : {}),
        ...(data.assignedTo !== undefined ? { assignedTo: data.assignedTo } : {}),
      },
    });
  },

  async softDelete(scope: Scope, id: string) {
    const existing = await prisma.lead.findFirst({ where: { id, deletedAt: null, ...scopeWhere(scope) } });
    if (!existing) return null;
    return prisma.lead.update({ where: { id }, data: { deletedAt: new Date() } });
  },

  logActivity(type: string, actorId: string, leadId: string, metadata?: Record<string, unknown>) {
    return prisma.activity.create({
      data: { type, actorId, relatedType: "LEAD", relatedId: leadId, metadata },
    });
  },
};
