import { useEffect, useState } from "react";
import { apiClient } from "@/lib/api-client";
import { useSessionStore } from "@/store/session";

/**
 * The access token lives only in memory, so a hard page refresh loses it.
 * On mount, silently try to trade the httpOnly refresh cookie for a new
 * access token. If it fails, the user is simply treated as logged out.
 */
export function useBootstrapSession() {
  const setSession = useSessionStore((s) => s.setSession);
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    let cancelled = false;

    apiClient
      .post("/auth/refresh")
      .then(({ data }) => {
        if (!cancelled) setSession(data.data.user, data.data.accessToken);
      })
      .catch(() => {
        // No valid session — proceed as logged out.
      })
      .finally(() => {
        if (!cancelled) setIsReady(true);
      });

    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return isReady;
}
