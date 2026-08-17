import { useEffect } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { useSessionStore } from "@/store/session";

const API_BASE_URL = import.meta.env.VITE_API_URL || "/api/v1";

interface StreamEvent {
  kind: "connected" | "notification";
  notification?: unknown;
}

/**
 * Opens a single Server-Sent Events connection for the lifetime of the
 * authenticated session and invalidates notification queries whenever the
 * server pushes something new — this is what makes the bell "real-time"
 * instead of purely poll-based.
 */
export function useNotificationStream() {
  const accessToken = useSessionStore((s) => s.accessToken);
  const isAuthenticated = !!useSessionStore((s) => s.user);
  const qc = useQueryClient();

  useEffect(() => {
    if (!isAuthenticated || !accessToken) return;

    const source = new EventSource(`${API_BASE_URL}/notifications/stream?token=${encodeURIComponent(accessToken)}`);

    source.onmessage = (event) => {
      try {
        const payload = JSON.parse(event.data) as StreamEvent;
        if (payload.kind === "notification") {
          qc.invalidateQueries({ queryKey: ["notifications"] });
        }
      } catch {
        // ignore malformed frames
      }
    };

    source.onerror = () => {
      // EventSource retries automatically; nothing to do here beyond letting it.
    };

    return () => source.close();
    // Intentionally keyed on the boolean, not the token value itself — an
    // already-open connection stays valid across silent token refreshes.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isAuthenticated]);
}
