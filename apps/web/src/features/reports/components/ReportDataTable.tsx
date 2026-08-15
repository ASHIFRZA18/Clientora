import { cn } from "@/lib/utils";
import type { ReportColumn } from "../types";

export function ReportDataTable({
  columns,
  rows,
  isLoading,
}: {
  columns: ReportColumn[];
  rows: Record<string, string>[];
  isLoading?: boolean;
}) {
  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-line">
            {columns.map((col) => (
              <th
                key={col.key}
                className={cn(
                  "px-3 py-2.5 text-xs font-medium text-muted uppercase tracking-wide whitespace-nowrap",
                  col.align === "right" ? "text-right" : "text-left"
                )}
              >
                {col.header}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {isLoading &&
            Array.from({ length: 6 }).map((_, i) => (
              <tr key={i} className="border-b border-line">
                {columns.map((col) => (
                  <td key={col.key} className="px-3 py-3">
                    <div className="h-3.5 rounded bg-slate-100 animate-pulse w-full max-w-[120px]" />
                  </td>
                ))}
              </tr>
            ))}

          {!isLoading && rows.length === 0 && (
            <tr>
              <td colSpan={columns.length} className="px-3 py-10 text-center text-sm text-muted">
                No data in the selected range.
              </td>
            </tr>
          )}

          {!isLoading &&
            rows.map((row, i) => (
              <tr key={i} className="border-b border-line last:border-0">
                {columns.map((col) => (
                  <td
                    key={col.key}
                    className={cn(
                      "px-3 py-2.5 text-ink whitespace-nowrap",
                      col.align === "right" ? "text-right tabular-nums" : "text-left"
                    )}
                  >
                    {row[col.key]}
                  </td>
                ))}
              </tr>
            ))}
        </tbody>
      </table>
    </div>
  );
}
