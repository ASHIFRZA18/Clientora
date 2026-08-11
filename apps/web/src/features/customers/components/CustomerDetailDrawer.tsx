import { useState } from "react";
import { Building2, Loader2, Mail, Phone, Send, Trash2 } from "lucide-react";
import { Drawer } from "@/components/ui/Drawer";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { useCustomer, useCustomerNotes, useAddCustomerNote } from "../hooks";

const stageTone: Record<string, "neutral" | "success" | "warning" | "danger" | "accent"> = {
  NEW_LEAD: "neutral",
  CONTACTED: "accent",
  QUALIFIED: "accent",
  PROPOSAL_SENT: "warning",
  NEGOTIATION: "warning",
  WON: "success",
  LOST: "danger",
};

function timeAgo(iso: string) {
  const diffMs = Date.now() - new Date(iso).getTime();
  const mins = Math.floor(diffMs / 60000);
  if (mins < 1) return "just now";
  if (mins < 60) return `${mins}m ago`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours}h ago`;
  return `${Math.floor(hours / 24)}d ago`;
}

export function CustomerDetailDrawer({
  customerId,
  onClose,
  onEdit,
  onDelete,
}: {
  customerId: string | null;
  onClose: () => void;
  onEdit: () => void;
  onDelete: () => void;
}) {
  const { data: customer, isLoading } = useCustomer(customerId);
  const { data: notes } = useCustomerNotes(customerId);
  const addNote = useAddCustomerNote(customerId ?? "");
  const [noteText, setNoteText] = useState("");

  const handleAddNote = () => {
    if (!noteText.trim()) return;
    addNote.mutate(noteText.trim(), { onSuccess: () => setNoteText("") });
  };

  return (
    <Drawer open={!!customerId} onClose={onClose} title={customer?.name ?? "Customer"} subtitle={customer?.company ?? undefined}>
      {isLoading || !customer ? (
        <div className="flex items-center justify-center py-10">
          <Loader2 className="h-5 w-5 text-muted animate-spin" />
        </div>
      ) : (
        <div className="space-y-5">
          <div className="flex items-center gap-2">
            <Badge tone={customer.status === "active" ? "success" : "neutral"}>{customer.status}</Badge>
            <span className="text-xs text-muted">Owned by {customer.owner.name}</span>
          </div>

          <div className="space-y-1.5 text-sm">
            {customer.company && (
              <div className="flex items-center gap-2 text-ink">
                <Building2 className="h-3.5 w-3.5 text-muted" /> {customer.company}
              </div>
            )}
            {customer.email && (
              <div className="flex items-center gap-2 text-ink">
                <Mail className="h-3.5 w-3.5 text-muted" /> {customer.email}
              </div>
            )}
            {customer.phone && (
              <div className="flex items-center gap-2 text-ink">
                <Phone className="h-3.5 w-3.5 text-muted" /> {customer.phone}
              </div>
            )}
          </div>

          <div className="flex gap-2">
            <Button variant="outline" size="sm" onClick={onEdit} className="flex-1">
              Edit
            </Button>
            <Button variant="outline" size="sm" onClick={onDelete} className="text-danger hover:bg-danger/5">
              <Trash2 className="h-3.5 w-3.5" />
            </Button>
          </div>

          {customer.deals.length > 0 && (
            <div>
              <p className="text-xs font-medium text-muted uppercase tracking-wide mb-1.5">Deals</p>
              <div className="space-y-1">
                {customer.deals.map((deal) => (
                  <div key={deal.id} className="flex items-center justify-between text-sm py-1">
                    <span className="text-ink truncate">{deal.title}</span>
                    <Badge tone={stageTone[deal.stage] ?? "neutral"}>{deal.stage}</Badge>
                  </div>
                ))}
              </div>
            </div>
          )}

          {customer.leads.length > 0 && (
            <div>
              <p className="text-xs font-medium text-muted uppercase tracking-wide mb-1.5">Leads</p>
              <div className="space-y-1">
                {customer.leads.map((lead) => (
                  <div key={lead.id} className="flex items-center justify-between text-sm py-1">
                    <span className="text-ink">{lead.source ?? "Unknown source"}</span>
                    <span className="text-xs text-muted">Score {lead.score}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          <div>
            <p className="text-xs font-medium text-muted uppercase tracking-wide mb-1.5">Notes</p>
            <div className="flex gap-1.5 mb-2.5">
              <input
                value={noteText}
                onChange={(e) => setNoteText(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleAddNote()}
                placeholder="Add a note…"
                className="flex-1 h-9 rounded-md border border-line bg-surface px-2.5 text-sm focus:outline-none focus:border-primary focus:shadow-focus"
              />
              <Button size="sm" onClick={handleAddNote} disabled={addNote.isPending || !noteText.trim()}>
                <Send className="h-3.5 w-3.5" />
              </Button>
            </div>
            <div className="space-y-2.5">
              {notes?.length === 0 && <p className="text-xs text-muted">No notes yet.</p>}
              {notes?.map((note) => (
                <div key={note.id} className="rounded-md bg-canvas px-2.5 py-2">
                  <p className="text-sm text-ink">{note.body}</p>
                  <p className="text-[11px] text-muted mt-1">
                    {note.author.name} · {timeAgo(note.createdAt)}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </Drawer>
  );
}
