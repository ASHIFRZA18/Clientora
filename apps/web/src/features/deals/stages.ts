import type { DealStage } from "./types";

export const STAGE_ORDER: DealStage[] = [
  "NEW_LEAD",
  "CONTACTED",
  "QUALIFIED",
  "PROPOSAL_SENT",
  "NEGOTIATION",
  "WON",
  "LOST",
];

export const STAGE_META: Record<DealStage, { label: string; accent: string; headerBg: string }> = {
  NEW_LEAD: { label: "New Lead", accent: "bg-slate-400", headerBg: "bg-slate-50" },
  CONTACTED: { label: "Contacted", accent: "bg-accent", headerBg: "bg-cyan-50" },
  QUALIFIED: { label: "Qualified", accent: "bg-primary", headerBg: "bg-primary-50" },
  PROPOSAL_SENT: { label: "Proposal Sent", accent: "bg-warning", headerBg: "bg-amber-50" },
  NEGOTIATION: { label: "Negotiation", accent: "bg-orange-500", headerBg: "bg-orange-50" },
  WON: { label: "Won", accent: "bg-success", headerBg: "bg-emerald-50" },
  LOST: { label: "Lost", accent: "bg-danger", headerBg: "bg-red-50" },
};

export function formatCurrency(value: string | number, currency = "USD") {
  const n = typeof value === "string" ? Number(value) : value;
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency,
    maximumFractionDigits: 0,
  }).format(n);
}
