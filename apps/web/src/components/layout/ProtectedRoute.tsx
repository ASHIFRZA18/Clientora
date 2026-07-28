import type { ReactNode } from "react";
import { Navigate } from "react-router-dom";
import { useSessionStore, type Role } from "@/store/session";

export function ProtectedRoute({
  children,
  allow,
}: {
  children: ReactNode;
  allow?: Role[];
}) {
  const user = useSessionStore((s) => s.user);

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  if (allow && !allow.includes(user.role)) {
    return <Navigate to="/" replace />;
  }

  return <>{children}</>;
}
