import { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { Plus } from "lucide-react";
import { AppShell } from "@/components/layout/AppShell";
import { Button } from "@/components/ui/Button";
import { ConfirmDialog } from "@/components/ui/ConfirmDialog";
import { Board } from "@/features/deals/components/Board";
import { DealFormDrawer } from "@/features/deals/components/DealFormDrawer";
import { DealDetailDrawer } from "@/features/deals/components/DealDetailDrawer";
import { useDeleteDeal } from "@/features/deals/hooks";

export default function Pipeline() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [formOpen, setFormOpen] = useState(false);
  const [detailId, setDetailId] = useState<string | null>(null);
  const [pendingDeleteId, setPendingDeleteId] = useState<string | null>(null);
  const deleteDeal = useDeleteDeal();

  useEffect(() => {
    if (searchParams.get("new") === "1") {
      setFormOpen(true);
      setSearchParams((prev) => {
        prev.delete("new");
        return prev;
      });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchParams]);

  const confirmDelete = () => {
    if (!pendingDeleteId) return;
    deleteDeal.mutate(pendingDeleteId, {
      onSuccess: () => {
        setPendingDeleteId(null);
        setDetailId(null);
      },
    });
  };

  return (
    <AppShell title="Pipeline">
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <p className="text-xs text-muted">Drag a card between columns to update its stage.</p>
          <Button size="sm" onClick={() => setFormOpen(true)}>
            <Plus className="h-3.5 w-3.5" />
            New deal
          </Button>
        </div>

        <Board onCardClick={setDetailId} />
      </div>

      <DealFormDrawer open={formOpen} onClose={() => setFormOpen(false)} />

      <DealDetailDrawer
        dealId={detailId}
        onClose={() => setDetailId(null)}
        onDelete={() => setPendingDeleteId(detailId)}
      />

      <ConfirmDialog
        open={!!pendingDeleteId}
        title="Delete this deal?"
        description="This removes it from the pipeline permanently from view. This can't be undone from here."
        confirmLabel="Delete"
        isLoading={deleteDeal.isPending}
        onConfirm={confirmDelete}
        onCancel={() => setPendingDeleteId(null)}
      />
    </AppShell>
  );
}
