import { useEffect, useState } from "react";
import { Building2, Loader2, Tag, Trash2 } from "lucide-react";
import { Drawer } from "@/components/ui/Drawer";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { useDeal, useUpdateDeal } from "../hooks";
import { STAGE_META, formatCurrency } from "../stages";

export function DealDetailDrawer({
  dealId,
  onClose,
  onDelete,
}: {
  dealId: string | null;
  onClose: () => void;
  onDelete: () => void;
}) {
  const { data: deal, isLoading } = useDeal(dealId);
  const updateDeal = useUpdateDeal(dealId ?? "");
  const [title, setTitle] = useState("");
  const [value, setValue] = useState("");

  useEffect(() => {
    if (deal) {
      setTitle(deal.title);
      setValue(deal.value);
    }
  }, [deal]);

  const saveTitle = () => {
    if (deal && title.trim() && title !== deal.title) updateDeal.mutate({ title: title.trim() });
  };

  const saveValue = () => {
    const n = Number(value);
    if (deal && !Number.isNaN(n) && n !== Number(deal.value)) updateDeal.mutate({ value: n });
  };

  return (
    <Drawer open={!!dealId} onClose={onClose} title="Deal" subtitle={deal?.customer.name}>
      {isLoading || !deal ? (
        <div className="flex items-center justify-center py-10">
          <Loader2 className="h-5 w-5 text-muted animate-spin" />
        </div>
      ) : (
        <div className="space-y-4">
          <Badge tone="accent">{STAGE_META[deal.stage].label}</Badge>

          <Input label="Title" value={title} onChange={(e) => setTitle(e.target.value)} onBlur={saveTitle} />

          <Input
            label="Value (USD)"
            type="number"
            min={0}
            step="0.01"
            value={value}
            onChange={(e) => setValue(e.target.value)}
            onBlur={saveValue}
          />

          <div className="space-y-1.5 text-sm">
            {deal.customer.company && (
              <div className="flex items-center gap-2 text-ink">
                <Building2 className="h-3.5 w-3.5 text-muted" /> {deal.customer.company}
              </div>
            )}
            {deal.lead?.source && (
              <div className="flex items-center gap-2 text-ink">
                <Tag className="h-3.5 w-3.5 text-muted" /> Sourced via {deal.lead.source}
              </div>
            )}
          </div>

          <div className="rounded-md bg-canvas px-2.5 py-2 text-xs text-muted space-y-1">
            <p>Owner: {deal.owner.name}</p>
            {deal.expectedCloseDate && (
              <p>Expected close: {new Date(deal.expectedCloseDate).toLocaleDateString()}</p>
            )}
            {deal.closedAt && <p>Closed: {new Date(deal.closedAt).toLocaleDateString()}</p>}
            <p>Current value: {formatCurrency(deal.value, deal.currency)}</p>
          </div>

          <Button variant="outline" size="sm" onClick={onDelete} className="text-danger hover:bg-danger/5 w-full">
            <Trash2 className="h-3.5 w-3.5" /> Delete deal
          </Button>
        </div>
      )}
    </Drawer>
  );
}
