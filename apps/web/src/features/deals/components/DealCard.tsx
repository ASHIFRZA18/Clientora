import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { Building2, Calendar } from "lucide-react";
import { cn } from "@/lib/utils";
import { formatCurrency } from "../stages";
import type { Deal } from "../types";

function initials(name: string) {
  return name
    .split(" ")
    .map((p) => p[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();
}

function isOverdue(iso: string | null) {
  if (!iso) return false;
  return new Date(iso).getTime() < Date.now();
}

export function DealCard({ deal, onClick }: { deal: Deal; onClick: () => void }) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id: deal.id,
  });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
      onClick={onClick}
      className={cn(
        "rounded-md border border-line bg-surface p-2.5 shadow-subtle cursor-grab active:cursor-grabbing",
        "hover:border-primary-100 hover:shadow-card transition-shadow",
        isDragging && "opacity-40"
      )}
    >
      <p className="text-sm font-medium text-ink leading-snug line-clamp-2">{deal.title}</p>

      {deal.customer.company && (
        <p className="text-xs text-muted flex items-center gap-1 mt-1.5">
          <Building2 className="h-3 w-3" /> {deal.customer.company}
        </p>
      )}

      <div className="flex items-center justify-between mt-2.5">
        <span className="text-sm font-semibold text-ink tabular-nums">
          {formatCurrency(deal.value, deal.currency)}
        </span>
        <div
          className="h-5 w-5 rounded-full bg-primary-100 text-primary text-[10px] font-semibold flex items-center justify-center"
          title={deal.owner.name}
        >
          {initials(deal.owner.name)}
        </div>
      </div>

      {deal.expectedCloseDate && !deal.closedAt && (
        <p
          className={cn(
            "text-[11px] flex items-center gap-1 mt-1.5",
            isOverdue(deal.expectedCloseDate) ? "text-danger" : "text-muted"
          )}
        >
          <Calendar className="h-3 w-3" />
          {new Date(deal.expectedCloseDate).toLocaleDateString(undefined, { month: "short", day: "numeric" })}
        </p>
      )}
    </div>
  );
}
