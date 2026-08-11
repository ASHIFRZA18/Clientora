import { Building2, Loader2, RefreshCw, Trash2, UserCheck, UserMinus } from "lucide-react";
import { Drawer } from "@/components/ui/Drawer";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Select } from "@/components/ui/Select";
import { useSessionStore } from "@/store/session";
import { useLead, useUpdateLead, useAssignLead, useRecalculateLeadScore } from "../hooks";
import { leadStatusOptions } from "../schema";
import { LeadStatusBadge } from "./LeadStatusBadge";
import { ScoreBar } from "./ScoreBar";
import type { LeadStatus } from "../types";

const stageTone: Record<string, "neutral" | "success" | "warning" | "danger" | "accent"> = {
  NEW_LEAD: "neutral",
  CONTACTED: "accent",
  QUALIFIED: "accent",
  PROPOSAL_SENT: "warning",
  NEGOTIATION: "warning",
  WON: "success",
  LOST: "danger",
};

export function LeadDetailDrawer({
  leadId,
  onClose,
  onDelete,
}: {
  leadId: string | null;
  onClose: () => void;
  onDelete: () => void;
}) {
  const currentUser = useSessionStore((s) => s.user);
  const { data: lead, isLoading } = useLead(leadId);
  const updateLead = useUpdateLead(leadId ?? "");
  const assignLead = useAssignLead(leadId ?? "");
  const recalcScore = useRecalculateLeadScore(leadId ?? "");

  const isMine = !!lead && !!currentUser && lead.assignedTo === currentUser.id;

  return (
    <Drawer
      open={!!leadId}
      onClose={onClose}
      title={lead?.customer.name ?? "Lead"}
      subtitle={lead?.customer.company ?? undefined}
    >
      {isLoading || !lead ? (
        <div className="flex items-center justify-center py-10">
          <Loader2 className="h-5 w-5 text-muted animate-spin" />
        </div>
      ) : (
        <div className="space-y-5">
          <div className="flex items-center gap-2 flex-wrap">
            <LeadStatusBadge status={lead.status} />
            {lead.source && <Badge tone="neutral">{lead.source}</Badge>}
          </div>

          {lead.customer.company && (
            <div className="flex items-center gap-2 text-sm text-ink">
              <Building2 className="h-3.5 w-3.5 text-muted" /> {lead.customer.company}
            </div>
          )}

          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <label className="text-xs font-medium text-muted uppercase tracking-wide">Score</label>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => recalcScore.mutate()}
                disabled={recalcScore.isPending}
                className="h-6 px-1.5 text-xs"
              >
                <RefreshCw className={`h-3 w-3 ${recalcScore.isPending ? "animate-spin" : ""}`} />
                Recalculate
              </Button>
            </div>
            <ScoreBar score={lead.score} />
          </div>

          <div className="space-y-1">
            <label className="text-xs font-medium text-muted uppercase tracking-wide">Status</label>
            <Select
              value={lead.status}
              onChange={(e) => updateLead.mutate({ status: e.target.value as LeadStatus })}
              className="w-full"
              disabled={updateLead.isPending}
            >
              {leadStatusOptions.map((s) => (
                <option key={s} value={s}>
                  {s.charAt(0) + s.slice(1).toLowerCase()}
                </option>
              ))}
            </Select>
          </div>

          <div className="space-y-1">
            <label className="text-xs font-medium text-muted uppercase tracking-wide">Assigned to</label>
            <div className="flex items-center justify-between rounded-md border border-line px-2.5 py-2">
              <span className="text-sm text-ink">{lead.assignee?.name ?? "Unassigned"}</span>
              {!isMine && (
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => assignLead.mutate(currentUser!.id)}
                  disabled={assignLead.isPending}
                >
                  <UserCheck className="h-3.5 w-3.5" /> Assign to me
                </Button>
              )}
              {isMine && (
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => assignLead.mutate(null)}
                  disabled={assignLead.isPending}
                >
                  <UserMinus className="h-3.5 w-3.5" /> Unassign
                </Button>
              )}
            </div>
            {assignLead.isError && (
              <p className="text-xs text-danger">
                {(assignLead.error as any)?.response?.data?.error?.message ?? "Couldn't update assignment."}
              </p>
            )}
          </div>

          {lead.deals.length > 0 && (
            <div>
              <p className="text-xs font-medium text-muted uppercase tracking-wide mb-1.5">Deals</p>
              <div className="space-y-1">
                {lead.deals.map((deal) => (
                  <div key={deal.id} className="flex items-center justify-between text-sm py-1">
                    <span className="text-ink truncate">{deal.title}</span>
                    <Badge tone={stageTone[deal.stage] ?? "neutral"}>{deal.stage}</Badge>
                  </div>
                ))}
              </div>
            </div>
          )}

          <Button
            variant="outline"
            size="sm"
            onClick={onDelete}
            className="text-danger hover:bg-danger/5 w-full"
          >
            <Trash2 className="h-3.5 w-3.5" /> Delete lead
          </Button>
        </div>
      )}
    </Drawer>
  );
}
