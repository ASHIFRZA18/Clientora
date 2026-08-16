import { useEffect, useRef, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Check, ChevronDown, Loader2, Search } from "lucide-react";
import { cn } from "@/lib/utils";
import { useDebouncedValue } from "@/lib/use-debounced-value";
import { listCustomers } from "@/features/customers/api/customers.api";

export function CustomerPicker({
  value,
  label,
  onChange,
  error,
  disabled,
}: {
  value: string;
  /** Display name for the currently selected customer, shown when the dropdown is closed. */
  label?: string;
  onChange: (id: string, label: string) => void;
  error?: string;
  disabled?: boolean;
}) {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const debouncedQuery = useDebouncedValue(query, 250);
  const containerRef = useRef<HTMLDivElement>(null);

  const { data, isLoading } = useQuery({
    queryKey: ["customers", "picker", debouncedQuery],
    queryFn: () =>
      listCustomers({ page: 1, pageSize: 8, search: debouncedQuery || undefined, sortBy: "name", sortDir: "asc" }),
    enabled: open,
  });

  useEffect(() => {
    function onClickOutside(e: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", onClickOutside);
    return () => document.removeEventListener("mousedown", onClickOutside);
  }, []);

  return (
    <div className="space-y-1" ref={containerRef}>
      <label className="block text-[13px] font-medium text-ink">Customer</label>
      <div className="relative">
        <button
          type="button"
          disabled={disabled}
          onClick={() => setOpen((o) => !o)}
          className={cn(
            "w-full h-10 rounded-md border border-line bg-surface px-3 text-sm text-left flex items-center justify-between",
            "focus:outline-none focus:border-primary focus:shadow-focus transition-shadow",
            error && "border-danger",
            disabled && "opacity-50 cursor-not-allowed"
          )}
        >
          <span className={cn(value ? "text-ink" : "text-muted/70")}>
            {value ? label ?? "Selected customer" : "Search customers…"}
          </span>
          <ChevronDown className="h-3.5 w-3.5 text-muted shrink-0" />
        </button>

        {open && (
          <div className="absolute z-20 mt-1 w-full rounded-md border border-line bg-surface shadow-elevated overflow-hidden">
            <div className="flex items-center gap-1.5 border-b border-line px-2.5 py-2">
              <Search className="h-3.5 w-3.5 text-muted shrink-0" />
              <input
                autoFocus
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Type a name or company…"
                className="w-full text-sm focus:outline-none"
              />
            </div>
            <div className="max-h-56 overflow-y-auto">
              {isLoading && (
                <div className="flex items-center justify-center py-4">
                  <Loader2 className="h-4 w-4 text-muted animate-spin" />
                </div>
              )}
              {!isLoading && data?.data.length === 0 && (
                <p className="px-3 py-3 text-sm text-muted">No customers found.</p>
              )}
              {!isLoading &&
                data?.data.map((c) => (
                  <button
                    key={c.id}
                    type="button"
                    onClick={() => {
                      onChange(c.id, c.company ? `${c.name} — ${c.company}` : c.name);
                      setOpen(false);
                      setQuery("");
                    }}
                    className="w-full flex items-center justify-between gap-2 px-3 py-2 text-left text-sm hover:bg-canvas"
                  >
                    <span>
                      <span className="text-ink">{c.name}</span>
                      {c.company && <span className="text-muted"> — {c.company}</span>}
                    </span>
                    {value === c.id && <Check className="h-3.5 w-3.5 text-primary shrink-0" />}
                  </button>
                ))}
            </div>
          </div>
        )}
      </div>
      {error && <p className="text-xs text-danger">{error}</p>}
    </div>
  );
}
