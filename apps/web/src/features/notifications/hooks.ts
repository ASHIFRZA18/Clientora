import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  listNotifications,
  getUnreadCount,
  markNotificationRead,
  markAllNotificationsRead,
} from "./api/notifications.api";

export function useNotifications(page = 1, pageSize = 20) {
  return useQuery({
    queryKey: ["notifications", "list", page, pageSize],
    queryFn: () => listNotifications(page, pageSize),
  });
}

export function useUnreadCount() {
  return useQuery({
    queryKey: ["notifications", "unread-count"],
    queryFn: getUnreadCount,
    // Falls back to polling if the SSE push connection ever drops.
    refetchInterval: 60_000,
  });
}

export function useMarkNotificationRead() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => markNotificationRead(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["notifications"] });
    },
  });
}

export function useMarkAllNotificationsRead() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: markAllNotificationsRead,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["notifications"] });
    },
  });
}
