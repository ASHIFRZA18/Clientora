import { LogOut } from "lucide-react";
import { useSessionStore } from "@/store/session";
import { useLogout } from "@/features/auth/hooks";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";

const roleLabels: Record<string, string> = {
  ADMIN: "Admin",
  SALES_MANAGER: "Sales Manager",
  SALES_EXECUTIVE: "Sales Executive",
};

export function Topbar({ title }: { title: string }) {
  const user = useSessionStore((s) => s.user);
  const logout = useLogout();

  return (
    <header className="h-14 border-b border-line bg-surface flex items-center justify-between px-4">
      <h1 className="text-sm font-semibold text-ink">{title}</h1>
      <div className="flex items-center gap-3">
        <Badge tone="neutral">{roleLabels[user?.role ?? ""] ?? user?.role}</Badge>
        <div className="flex items-center gap-2">
          <div className="h-7 w-7 rounded-full bg-secondary text-white text-xs font-medium flex items-center justify-center">
            {user?.name
              .split(" ")
              .map((p) => p[0])
              .slice(0, 2)
              .join("")}
          </div>
          <span className="text-sm text-ink hidden sm:inline">{user?.name}</span>
        </div>
        <Button variant="ghost" size="sm" onClick={() => logout.mutate()} disabled={logout.isPending}>
          <LogOut className="h-3.5 w-3.5" />
        </Button>
      </div>
    </header>
  );
}
