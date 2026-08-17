import { useEffect, useRef, useState } from "react";
import { Download, FileSpreadsheet, FileText, Loader2, Table2 } from "lucide-react";
import { Button } from "@/components/ui/Button";
import type { ReportFormat } from "../types";

const formats: { value: Exclude<ReportFormat, "json">; label: string; icon: typeof Download }[] = [
  { value: "csv", label: "CSV", icon: Table2 },
  { value: "xlsx", label: "Excel", icon: FileSpreadsheet },
  { value: "pdf", label: "PDF", icon: FileText },
];

export function ExportMenu({
  onExport,
  isExporting,
}: {
  onExport: (format: Exclude<ReportFormat, "json">) => void;
  isExporting?: boolean;
}) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function onClickOutside(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    }
    document.addEventListener("mousedown", onClickOutside);
    return () => document.removeEventListener("mousedown", onClickOutside);
  }, []);

  return (
    <div className="relative" ref={ref}>
      <Button variant="outline" size="sm" onClick={() => setOpen((o) => !o)} disabled={isExporting}>
        {isExporting ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Download className="h-3.5 w-3.5" />}
        Export
      </Button>
      {open && (
        <div className="absolute right-0 mt-1 w-36 rounded-md border border-line bg-surface shadow-elevated overflow-hidden z-20">
          {formats.map(({ value, label, icon: Icon }) => (
            <button
              key={value}
              onClick={() => {
                onExport(value);
                setOpen(false);
              }}
              className="w-full flex items-center gap-2 px-3 py-2 text-sm text-ink hover:bg-canvas text-left"
            >
              <Icon className="h-3.5 w-3.5 text-muted" />
              {label}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
