import { prisma } from "../../lib/prisma.js";

export const notificationsRepository = {
  async list(userId: string, page: number, pageSize: number) {
    const where = { userId };
    const [items, total, unreadCount] = await Promise.all([
      prisma.notification.findMany({
        where,
        orderBy: { createdAt: "desc" },
        skip: (page - 1) * pageSize,
        take: pageSize,
      }),
      prisma.notification.count({ where }),
      prisma.notification.count({ where: { userId, readAt: null } }),
    ]);
    return { items, total, unreadCount };
  },

  unreadCount(userId: string) {
    return prisma.notification.count({ where: { userId, readAt: null } });
  },

  async markRead(userId: string, id: string) {
    const existing = await prisma.notification.findFirst({ where: { id, userId } });
    if (!existing) return null;
    if (existing.readAt) return existing;
    return prisma.notification.update({ where: { id }, data: { readAt: new Date() } });
  },

  markAllRead(userId: string) {
    return prisma.notification.updateMany({
      where: { userId, readAt: null },
      data: { readAt: new Date() },
    });
  },

  create(data: { userId: string; type: string; payload?: Record<string, unknown> }) {
    return prisma.notification.create({ data: { ...data, payload: data.payload as any } });
  },
};
