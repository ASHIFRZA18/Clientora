import { apiClient } from "@/lib/api-client";
import type { AppNotification, Paginated } from "../types";

export async function listNotifications(page = 1, pageSize = 20): Promise<Paginated<AppNotification>> {
  const { data } = await apiClient.get<{ data: AppNotification[]; meta: Paginated<AppNotification>["meta"] }>(
    "/notifications",
    { params: { page, pageSize } }
  );
  return { data: data.data, meta: data.meta };
}

export async function getUnreadCount(): Promise<number> {
  const { data } = await apiClient.get<{ data: { count: number } }>("/notifications/unread-count");
  return data.data.count;
}

export async function markNotificationRead(id: string): Promise<AppNotification> {
  const { data } = await apiClient.patch<{ data: AppNotification }>(`/notifications/${id}/read`);
  return data.data;
}

export async function markAllNotificationsRead(): Promise<void> {
  await apiClient.post("/notifications/read-all");
}
