import { Handshake, Target, TrendingUp, Users } from "lucide-react";

const items = [
  { icon: Users, label: "Customers", value: "1,284" },
  { icon: Target, label: "New leads", value: "312" },
  { icon: Handshake, label: "Deals won", value: "58" },
  { icon: TrendingUp, label: "Revenue", value: "$128.4K" },
];

/**
 * Mobile fallback: communicates the same "customers → leads → deals →
 * revenue" story without a WebGL canvas, keeping first paint fast and
 * battery/data usage low on small screens.
 */
export function CRMHeroFallback() {
  return (
    <div className="relative h-full w-full flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-gradient-to-br from-primary-50 via-white to-white" />
      <div className="relative grid grid-cols-2 gap-2.5 w-full max-w-xs">
        {items.map(({ icon: Icon, label, value }) => (
          <div
            key={label}
            className="rounded-lg border border-white/70 bg-white/70 backdrop-blur-md shadow-card px-3 py-2.5"
          >
            <Icon className="h-3.5 w-3.5 text-primary mb-1.5" />
            <p className="text-sm font-bold text-ink leading-none">{value}</p>
            <p className="text-[11px] text-muted mt-1">{label}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
