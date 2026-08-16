import type { ReactNode } from "react";
import { useSessionStore } from "@/store/session";
import { useNotificationStream } from "@/features/notifications/use-notification-stream";
import { Sidebar } from "./Sidebar";
import { Topbar } from "./Topbar";

export function AppShell({ title, children }: { title: string; children: ReactNode }) {
  const role = useSessionStore((s) => s.user?.role);
  useNotificationStream();
  if (!role) return null;

  return (
    <div className="min-h-screen flex bg-canvas">
      <Sidebar role={role} />
      <div className="flex-1 min-w-0 flex flex-col">
        <Topbar title={title} />
        <main className="flex-1 p-4 md:p-6 max-w-[1400px] w-full mx-auto">{children}</main>
      </div>
    </div>
  );
}
