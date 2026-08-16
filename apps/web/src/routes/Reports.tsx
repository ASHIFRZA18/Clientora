import { useState } from "react";
import { BarChart3, Target, Trophy, Users } from "lucide-react";
import { AppShell } from "@/components/layout/AppShell";
import { cn } from "@/lib/utils";
import { useReport, useDownloadReport } from "@/features/reports/hooks";
import { ReportSummary } from "@/features/reports/components/ReportSummary";
import { ReportDataTable } from "@/features/reports/components/ReportDataTable";
import { ExportMenu } from "@/features/reports/components/ExportMenu";
import type { ReportType } from "@/features/reports/types";

const tabs: { value: ReportType; label: string; icon: typeof BarChart3 }[] = [
  { value: "revenue", label: "Revenue", icon: Trophy },
  { value: "leads", label: "Leads", icon: Target },
  { value: "customers", label: "Customers", icon: Users },
  { value: "performance", label: "Performance", icon: BarChart3 },
];

export default function Reports() {
  const [type, setType] = useState<ReportType>("revenue");
  const [from, setFrom] = useState("");
  const [to, setTo] = useState("");

  const query = { from: from || undefined, to: to || undefined };
  const { data, isLoading } = useReport(type, query);
  const download = useDownloadReport();

  return (
    <AppShell title="Reports">
      <div className="space-y-3">
        <div className="flex items-center gap-1 border-b border-line">
          {tabs.map(({ value, label, icon: Icon }) => (
            <button
              key={value}
              onClick={() => setType(value)}
              className={cn(
                "flex items-center gap-1.5 px-3 py-2 text-sm font-medium border-b-2 -mb-px transition-colors",
                type === value
                  ? "border-primary text-primary"
                  : "border-transparent text-muted hover:text-ink"
              )}
            >
              <Icon className="h-3.5 w-3.5" />
              {label}
            </button>
          ))}
        </div>

        <div className="flex flex-col sm:flex-row gap-2 sm:items-center sm:justify-between">
          <div className="flex items-center gap-2">
            <input
              type="date"
              value={from}
              onChange={(e) => setFrom(e.target.value)}
              className="h-9 rounded-md border border-line bg-surface px-2.5 text-sm focus:outline-none focus:border-primary focus:shadow-focus"
            />
            <span className="text-xs text-muted">to</span>
            <input
              type="date"
              value={to}
              onChange={(e) => setTo(e.target.value)}
              className="h-9 rounded-md border border-line bg-surface px-2.5 text-sm focus:outline-none focus:border-primary focus:shadow-focus"
            />
          </div>
          <ExportMenu
            isExporting={download.isPending}
            onExport={(format) => download.mutate({ type, query, format })}
          />
        </div>

        {data && <ReportSummary items={data.summary} />}

        <div className="rounded-lg border border-line bg-surface overflow-hidden">
          <ReportDataTable columns={data?.columns ?? []} rows={data?.rows ?? []} isLoading={isLoading} />
        </div>
      </div>
    </AppShell>
  );
}
