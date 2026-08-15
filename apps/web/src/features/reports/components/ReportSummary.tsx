import type { ReportSummaryItem } from "../types";

export function ReportSummary({ items }: { items: ReportSummaryItem[] }) {
  if (items.length === 0) return null;

  return (
    <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
      {items.map((item) => (
        <div key={item.label} className="rounded-lg border border-line bg-surface p-3">
          <p className="text-xs text-muted uppercase tracking-wide">{item.label}</p>
          <p className="text-lg font-semibold text-ink mt-0.5 tabular-nums">{item.value}</p>
        </div>
      ))}
    </div>
  );
}
