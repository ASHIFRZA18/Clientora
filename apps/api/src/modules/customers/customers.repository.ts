import { prisma } from "../../lib/prisma.js";
import type { ListCustomersQuery, CreateCustomerInput, UpdateCustomerInput } from "./customers.validation.js";

export interface Scope {
  /** Sales Executives are restricted to records they own. */
  ownerId?: string;
}

function scopeWhere(scope: Scope) {
  return scope.ownerId ? { ownerId: scope.ownerId } : {};
}

export const customersRepository = {
  async list(scope: Scope, query: ListCustomersQuery) {
    const where = {
      deletedAt: null,
      ...scopeWhere(scope),
      ...(query.status ? { status: query.status } : {}),
      ...(query.ownerId && !scope.ownerId ? { ownerId: query.ownerId } : {}),
      ...(query.search
        ? {
            OR: [
              { name: { contains: query.search, mode: "insensitive" as const } },
              { company: { contains: query.search, mode: "insensitive" as const } },
              { email: { contains: query.search, mode: "insensitive" as const } },
            ],
          }
        : {}),
    };

    const [items, total] = await Promise.all([
      prisma.customer.findMany({
        where,
        orderBy: { [query.sortBy]: query.sortDir },
        skip: (query.page - 1) * query.pageSize,
        take: query.pageSize,
        include: {
          owner: { select: { id: true, name: true } },
          _count: { select: { leads: true, deals: true } },
        },
      }),
      prisma.customer.count({ where }),
    ]);

    return { items, total };
  },

  findById(scope: Scope, id: string) {
    return prisma.customer.findFirst({
      where: { id, deletedAt: null, ...scopeWhere(scope) },
      include: {
        owner: { select: { id: true, name: true } },
        leads: { orderBy: { createdAt: "desc" }, take: 10 },
        deals: { orderBy: { createdAt: "desc" }, take: 10 },
      },
    });
  },

  create(data: CreateCustomerInput & { ownerId: string }) {
    return prisma.customer.create({
      data: {
        name: data.name,
        company: data.company || null,
        email: data.email || null,
        phone: data.phone || null,
        status: data.status,
        ownerId: data.ownerId,
      },
    });
  },

  async update(scope: Scope, id: string, data: UpdateCustomerInput) {
    const existing = await prisma.customer.findFirst({ where: { id, deletedAt: null, ...scopeWhere(scope) } });
    if (!existing) return null;
    return prisma.customer.update({
      where: { id },
      data: {
        ...(data.name !== undefined ? { name: data.name } : {}),
        ...(data.company !== undefined ? { company: data.company || null } : {}),
        ...(data.email !== undefined ? { email: data.email || null } : {}),
        ...(data.phone !== undefined ? { phone: data.phone || null } : {}),
        ...(data.status !== undefined ? { status: data.status } : {}),
        ...(data.ownerId !== undefined ? { ownerId: data.ownerId } : {}),
      },
    });
  },

  async softDelete(scope: Scope, id: string) {
    const existing = await prisma.customer.findFirst({ where: { id, deletedAt: null, ...scopeWhere(scope) } });
    if (!existing) return null;
    return prisma.customer.update({ where: { id }, data: { deletedAt: new Date() } });
  },

  notesFor(customerId: string) {
    return prisma.note.findMany({
      where: { relatedType: "CUSTOMER", relatedId: customerId },
      orderBy: { createdAt: "desc" },
      include: { author: { select: { name: true } } },
    });
  },

  addNote(customerId: string, authorId: string, body: string) {
    return prisma.note.create({
      data: { relatedType: "CUSTOMER", relatedId: customerId, authorId, body },
    });
  },

  logActivity(type: string, actorId: string, customerId: string, metadata?: Record<string, unknown>) {
    return prisma.activity.create({
      data: { type, actorId, relatedType: "CUSTOMER", relatedId: customerId, metadata },
    });
  },
};
