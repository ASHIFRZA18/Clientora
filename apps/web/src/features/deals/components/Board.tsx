import { useState } from "react";
import {
  DndContext,
  DragOverlay,
  PointerSensor,
  closestCorners,
  useSensor,
  useSensors,
  type DragEndEvent,
  type DragStartEvent,
} from "@dnd-kit/core";
import { Loader2 } from "lucide-react";
import { useBoard, useMoveDeal } from "../hooks";
import { STAGE_ORDER } from "../stages";
import { BoardColumn } from "./BoardColumn";
import { DealCard } from "./DealCard";
import type { DealStage } from "../types";

export function Board({ onCardClick }: { onCardClick: (id: string) => void }) {
  const { data: board, isLoading } = useBoard();
  const moveDeal = useMoveDeal();
  const [activeId, setActiveId] = useState<string | null>(null);

  const sensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 6 } }));

  if (isLoading || !board) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="h-5 w-5 text-muted animate-spin" />
      </div>
    );
  }

  const activeDeal = activeId ? board.flatMap((c) => c.deals).find((d) => d.id === activeId) : null;

  const handleDragStart = (event: DragStartEvent) => setActiveId(event.active.id as string);

  const handleDragEnd = (event: DragEndEvent) => {
    setActiveId(null);
    const { active, over } = event;
    if (!over) return;

    const activeCardId = active.id as string;
    const overId = over.id as string;

    const sourceCol = board.find((c) => c.deals.some((d) => d.id === activeCardId));
    if (!sourceCol) return;

    const isColumnDrop = (STAGE_ORDER as string[]).includes(overId);
    let destStage: DealStage;
    let destIndex: number;

    if (isColumnDrop) {
      destStage = overId as DealStage;
      const destCol = board.find((c) => c.stage === destStage)!;
      destIndex = destCol.deals.filter((d) => d.id !== activeCardId).length;
    } else {
      const destCol = board.find((c) => c.deals.some((d) => d.id === overId));
      if (!destCol) return;
      destStage = destCol.stage;
      const filtered = destCol.deals.filter((d) => d.id !== activeCardId);
      const idx = filtered.findIndex((d) => d.id === overId);
      destIndex = idx === -1 ? filtered.length : idx;
    }

    const sourceIndex = sourceCol.deals.findIndex((d) => d.id === activeCardId);
    if (sourceCol.stage === destStage && sourceIndex === destIndex) return;

    moveDeal.mutate({ id: activeCardId, toStage: destStage, toIndex: destIndex });
  };

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCorners}
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
    >
      <div className="flex gap-3 overflow-x-auto pb-2 h-[calc(100vh-11rem)]">
        {board.map((column) => (
          <BoardColumn key={column.stage} column={column} onCardClick={onCardClick} />
        ))}
      </div>
      <DragOverlay>{activeDeal && <DealCard deal={activeDeal} onClick={() => {}} />}</DragOverlay>
    </DndContext>
  );
}
