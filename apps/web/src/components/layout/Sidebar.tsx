import { NavLink } from "react-router-dom";
import {
  LayoutDashboard,
  Users,
  Target,
  KanbanSquare,
  CheckSquare,
  BarChart3,
  ShieldCheck,
} from "lucide-react";
import { cn } from "@/lib/utils";
import type { Role } from "@/store/session";

interface NavItem {
  label: string;
  to: string;
  icon: typeof LayoutDashboard;
  roles?: Role[]; // undefined = all roles
  comingSoon?: boolean;
}

const items: NavItem[] = [
  { label: "Dashboard", to: "/", icon: LayoutDashboard },
<<<<<<< HEAD
  { label: "Customers", to: "/customers", icon: Users },
  { label: "Leads", to: "/leads", icon: Target },
=======
  { label: "Customers", to: "/customers", icon: Users, comingSoon: true },
  { label: "Leads", to: "/leads", icon: Target, comingSoon: true },
>>>>>>> 3584043af0c48b61060f01fbc6bdfa6d9fc4cb46
  { label: "Pipeline", to: "/pipeline", icon: KanbanSquare, comingSoon: true },
  { label: "Tasks", to: "/tasks", icon: CheckSquare, comingSoon: true },
  {
    label: "Reports",
    to: "/reports",
    icon: BarChart3,
    roles: ["ADMIN", "SALES_MANAGER"],
    comingSoon: true,
  },
  { label: "Audit Logs", to: "/audit-logs", icon: ShieldCheck, roles: ["ADMIN"], comingSoon: true },
];

export function Sidebar({ role }: { role: Role }) {
  const visible = items.filter((item) => !item.roles || item.roles.includes(role));

  return (
    <aside className="hidden md:flex flex-col w-56 shrink-0 border-r border-line bg-surface">
      <div className="h-14 flex items-center gap-2 px-4 border-b border-line">
        <div className="h-7 w-7 rounded-md bg-primary flex items-center justify-center">
          <span className="text-white font-bold text-xs">M</span>
        </div>
        <span className="font-semibold text-ink text-sm">Meridian CRM</span>
      </div>

      <nav className="flex-1 px-2 py-3 space-y-0.5">
        {visible.map(({ label, to, icon: Icon, comingSoon }) =>
          comingSoon ? (
            <div
              key={label}
              className="flex items-center justify-between gap-2 px-2.5 py-2 rounded-md text-sm text-muted/60 cursor-not-allowed select-none"
              title="Coming in a later phase"
            >
              <span className="flex items-center gap-2.5">
                <Icon className="h-4 w-4" strokeWidth={1.75} />
                {label}
              </span>
              <span className="text-[10px] font-medium uppercase tracking-wide bg-slate-100 text-muted px-1.5 py-0.5 rounded">
                Soon
              </span>
            </div>
          ) : (
            <NavLink
              key={label}
              to={to}
              end
              className={({ isActive }) =>
                cn(
                  "flex items-center gap-2.5 px-2.5 py-2 rounded-md text-sm font-medium transition-colors",
                  isActive
                    ? "bg-primary-50 text-primary"
                    : "text-ink/80 hover:bg-canvas hover:text-ink"
                )
              }
            >
              <Icon className="h-4 w-4" strokeWidth={1.75} />
              {label}
            </NavLink>
          )
        )}
      </nav>
    </aside>
  );
}
