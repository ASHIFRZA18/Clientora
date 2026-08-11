import { useDroppable } from "@dnd-kit/core";
import { SortableContext, verticalListSortingStrategy } from "@dnd-kit/sortable";
import { cn } from "@/lib/utils";
import { STAGE_META, formatCurrency } from "../stages";
import { DealCard } from "./DealCard";
import type { BoardColumn as BoardColumnType } from "../types";

export function BoardColumn({
  column,
  onCardClick,
}: {
  column: BoardColumnType;
  onCardClick: (id: string) => void;
}) {
  const meta = STAGE_META[column.stage];
  const { setNodeRef, isOver } = useDroppable({ id: column.stage });

  return (
    <div className="flex flex-col w-72 shrink-0 h-full">
      <div className={cn("rounded-t-md px-2.5 py-2 border border-b-0 border-line", meta.headerBg)}>
        <div className="flex items-center justify-between">
          <span className="flex items-center gap-1.5 text-sm font-medium text-ink">
            <span className={cn("h-1.5 w-1.5 rounded-full", meta.accent)} />
            {meta.label}
          </span>
          <span className="text-xs text-muted">{column.deals.length}</span>
        </div>
        <p className="text-xs text-muted mt-0.5 tabular-nums">{formatCurrency(column.totalValue)}</p>
      </div>

      <div
        ref={setNodeRef}
        className={cn(
          "flex-1 min-h-[120px] border border-line rounded-b-md bg-canvas p-2 space-y-2 overflow-y-auto transition-colors",
          isOver && "bg-primary-50/60"
        )}
      >
        <SortableContext items={column.deals.map((d) => d.id)} strategy={verticalListSortingStrategy}>
          {column.deals.map((deal) => (
            <DealCard key={deal.id} deal={deal} onClick={() => onCardClick(deal.id)} />
          ))}
        </SortableContext>
        {column.deals.length === 0 && (
          <div className="h-16 flex items-center justify-center text-xs text-muted/70 border border-dashed border-line rounded-md">
            Drop here
          </div>
        )}
      </div>
    </div>
  );
}
