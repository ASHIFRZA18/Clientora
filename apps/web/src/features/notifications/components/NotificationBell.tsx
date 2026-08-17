import { useEffect, useRef, useState } from "react";
import { Bell, CheckCheck, Handshake, TrendingDown, Trophy, UserPlus } from "lucide-react";
import { cn } from "@/lib/utils";
import { useNotifications, useUnreadCount, useMarkNotificationRead, useMarkAllNotificationsRead } from "../hooks";
import type { AppNotification, NotificationType } from "../types";

const iconFor: Record<NotificationType, typeof Bell> = {
  "lead.assigned": UserPlus,
  "lead.created": UserPlus,
  "deal.won": Trophy,
  "deal.lost": TrendingDown,
  "customer.note_added": Handshake,
};

function timeAgo(iso: string) {
  const diffMs = Date.now() - new Date(iso).getTime();
  const mins = Math.floor(diffMs / 60000);
  if (mins < 1) return "just now";
  if (mins < 60) return `${mins}m ago`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours}h ago`;
  return `${Math.floor(hours / 24)}d ago`;
}

function NotificationRow({ notification }: { notification: AppNotification }) {
  const markRead = useMarkNotificationRead();
  const Icon = iconFor[notification.type] ?? Bell;
  const isUnread = !notification.readAt;

  return (
    <button
      onClick={() => isUnread && markRead.mutate(notification.id)}
      className={cn(
        "w-full flex items-start gap-2.5 px-3 py-2.5 text-left hover:bg-canvas transition-colors",
        isUnread && "bg-primary-50/40"
      )}
    >
      <div
        className={cn(
          "h-7 w-7 rounded-full flex items-center justify-center shrink-0 mt-0.5",
          isUnread ? "bg-primary-100 text-primary" : "bg-slate-100 text-muted"
        )}
      >
        <Icon className="h-3.5 w-3.5" />
      </div>
      <div className="min-w-0 flex-1">
        <p className={cn("text-sm leading-snug", isUnread ? "text-ink font-medium" : "text-muted")}>
          {notification.payload.message}
        </p>
        <p className="text-[11px] text-muted mt-0.5">{timeAgo(notification.createdAt)}</p>
      </div>
      {isUnread && <div className="h-1.5 w-1.5 rounded-full bg-primary shrink-0 mt-1.5" />}
    </button>
  );
}

export function NotificationBell() {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const { data: unreadCount = 0 } = useUnreadCount();
  const { data } = useNotifications(1, 15);
  const markAllRead = useMarkAllNotificationsRead();

  useEffect(() => {
    function onClickOutside(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    }
    document.addEventListener("mousedown", onClickOutside);
    return () => document.removeEventListener("mousedown", onClickOutside);
  }, []);

  return (
    <div className="relative" ref={ref}>
      <button
        onClick={() => setOpen((o) => !o)}
        className="relative h-8 w-8 rounded-md flex items-center justify-center text-muted hover:bg-canvas hover:text-ink transition-colors"
        aria-label="Notifications"
      >
        <Bell className="h-4 w-4" />
        {unreadCount > 0 && (
          <span className="absolute top-0.5 right-0.5 h-4 min-w-[16px] px-0.5 rounded-full bg-danger text-white text-[10px] font-medium flex items-center justify-center">
            {unreadCount > 9 ? "9+" : unreadCount}
          </span>
        )}
      </button>

      {open && (
        <div className="absolute right-0 mt-1.5 w-80 rounded-md border border-line bg-surface shadow-elevated overflow-hidden z-30">
          <div className="flex items-center justify-between px-3 py-2 border-b border-line">
            <span className="text-sm font-medium text-ink">Notifications</span>
            {unreadCount > 0 && (
              <button
                onClick={() => markAllRead.mutate()}
                className="flex items-center gap-1 text-xs text-primary hover:underline"
              >
                <CheckCheck className="h-3 w-3" /> Mark all read
              </button>
            )}
          </div>
          <div className="max-h-96 overflow-y-auto">
            {data?.data.length === 0 && (
              <p className="px-3 py-8 text-center text-sm text-muted">You're all caught up.</p>
            )}
            {data?.data.map((n) => (
              <NotificationRow key={n.id} notification={n} />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
