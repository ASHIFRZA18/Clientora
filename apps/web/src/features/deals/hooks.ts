import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { getBoard, getDeal, createDeal, updateDeal, moveDeal, deleteDeal } from "./api/deals.api";
import type { DealFormValues } from "./schema";
import type { Board, DealStage } from "./types";

const BOARD_KEY = ["deals", "board"];

export function useBoard() {
  return useQuery({ queryKey: BOARD_KEY, queryFn: getBoard });
}

export function useDeal(id: string | null) {
  return useQuery({
    queryKey: ["deals", "detail", id],
    queryFn: () => getDeal(id!),
    enabled: !!id,
  });
}

export function useCreateDeal() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (input: DealFormValues) => createDeal(input),
    onSuccess: () => qc.invalidateQueries({ queryKey: BOARD_KEY }),
  });
}

export function useUpdateDeal(id: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (input: Partial<DealFormValues>) => updateDeal(id, input),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: BOARD_KEY });
      qc.invalidateQueries({ queryKey: ["deals", "detail", id] });
    },
  });
}

export function useDeleteDeal() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => deleteDeal(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: BOARD_KEY }),
  });
}

/**
 * Drag-and-drop move, applied optimistically so the card snaps into place
 * immediately instead of waiting on the round trip. Rolls back on failure.
 */
export function useMoveDeal() {
  const qc = useQueryClient();

  return useMutation({
    mutationFn: ({ id, toStage, toIndex }: { id: string; toStage: DealStage; toIndex: number }) =>
      moveDeal(id, toStage, toIndex),

    onMutate: async ({ id, toStage, toIndex }) => {
      await qc.cancelQueries({ queryKey: BOARD_KEY });
      const previous = qc.getQueryData<Board>(BOARD_KEY);

      if (previous) {
        const next = previous.map((col) => ({ ...col, deals: [...col.deals] }));
        let moved;
        for (const col of next) {
          const idx = col.deals.findIndex((d) => d.id === id);
          if (idx !== -1) {
            [moved] = col.deals.splice(idx, 1);
            break;
          }
        }
        if (moved) {
          const destCol = next.find((c) => c.stage === toStage);
          destCol?.deals.splice(Math.min(toIndex, destCol.deals.length), 0, { ...moved, stage: toStage });
          // Recompute totals so column headers stay accurate during the drag.
          for (const col of next) {
            col.totalValue = col.deals.reduce((sum, d) => sum + Number(d.value), 0);
          }
        }
        qc.setQueryData(BOARD_KEY, next);
      }

      return { previous };
    },

    onError: (_err, _vars, context) => {
      if (context?.previous) qc.setQueryData(BOARD_KEY, context.previous);
    },

    onSettled: () => qc.invalidateQueries({ queryKey: BOARD_KEY }),
  });
}
