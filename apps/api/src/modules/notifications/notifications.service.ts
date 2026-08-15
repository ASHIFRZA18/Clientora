import { notificationsRepository } from "./notifications.repository.js";
import { notificationBus } from "../../lib/notification-bus.js";
import { ApiError } from "../../middleware/error-handler.js";

export type NotificationType =
  | "lead.assigned"
  | "lead.created"
  | "deal.won"
  | "deal.lost"
  | "customer.note_added";

export const notificationsService = {
  async list(userId: string, page: number, pageSize: number) {
    const { items, total, unreadCount } = await notificationsRepository.list(userId, page, pageSize);
    return {
      items,
      unreadCount,
      pagination: { page, pageSize, total, totalPages: Math.max(1, Math.ceil(total / pageSize)) },
    };
  },

  unreadCount(userId: string) {
    return notificationsRepository.unreadCount(userId);
  },

  async markRead(userId: string, id: string) {
    const notification = await notificationsRepository.markRead(userId, id);
    if (!notification) throw new ApiError(404, "NOT_FOUND", "Notification not found");
    return notification;
  },

  markAllRead(userId: string) {
    return notificationsRepository.markAllRead(userId);
  },

  /**
   * The single entrypoint other modules call when something notification-worthy
   * happens. Persists the notification and, if the recipient has an open SSE
   * connection, pushes it to them immediately.
   */
  async notify(userId: string, type: NotificationType, message: string, meta: Record<string, unknown> = {}) {
    const notification = await notificationsRepository.create({
      userId,
      type,
      payload: { message, ...meta },
    });
    notificationBus.publish(userId, { kind: "notification", notification });
    return notification;
  },
};
