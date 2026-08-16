export type NotificationType = "lead.assigned" | "lead.created" | "deal.won" | "deal.lost" | "customer.note_added";

export interface AppNotification {
  id: string;
  type: NotificationType;
  payload: { message: string; [key: string]: unknown };
  readAt: string | null;
  createdAt: string;
}

export interface Paginated<T> {
  data: T[];
  meta: { page: number; pageSize: number; total: number; totalPages: number; unreadCount: number };
}
