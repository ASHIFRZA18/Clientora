import { Badge } from "@/components/ui/Badge";
import type { LeadStatus } from "../types";

const statusTone: Record<LeadStatus, "neutral" | "accent" | "success" | "danger"> = {
  NEW: "neutral",
  CONTACTED: "accent",
  QUALIFIED: "success",
  DISQUALIFIED: "danger",
};

const statusLabel: Record<LeadStatus, string> = {
  NEW: "New",
  CONTACTED: "Contacted",
  QUALIFIED: "Qualified",
  DISQUALIFIED: "Disqualified",
};

export function LeadStatusBadge({ status }: { status: LeadStatus }) {
  return <Badge tone={statusTone[status]}>{statusLabel[status]}</Badge>;
}
