import { Card, CardHeader, CardBody } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import type { DashboardOverview } from "../types";

const stageTone: Record<string, "neutral" | "success" | "warning" | "danger" | "accent"> = {
  NEW_LEAD: "neutral",
  CONTACTED: "accent",
  QUALIFIED: "accent",
  PROPOSAL_SENT: "warning",
  NEGOTIATION: "warning",
  WON: "success",
  LOST: "danger",
};

const stageLabels: Record<string, string> = {
  NEW_LEAD: "New Lead",
  CONTACTED: "Contacted",
  QUALIFIED: "Qualified",
  PROPOSAL_SENT: "Proposal Sent",
  NEGOTIATION: "Negotiation",
  WON: "Won",
  LOST: "Lost",
};

export function RecentDeals({ deals }: { deals: DashboardOverview["recentDeals"] }) {
  return (
    <Card>
      <CardHeader>
        <span className="text-sm font-medium text-ink">Recent deals</span>
      </CardHeader>
      <CardBody className="p-0">
        {deals.length === 0 ? (
          <p className="text-sm text-muted p-3">No deals yet.</p>
        ) : (
          <ul className="divide-y divide-line">
            {deals.map((deal) => (
              <li key={deal.id} className="flex items-center justify-between gap-3 px-3 py-2.5">
                <div className="min-w-0">
                  <p className="text-sm text-ink font-medium truncate">{deal.title}</p>
                  <p className="text-xs text-muted truncate">{deal.customerName}</p>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  <span className="text-sm font-medium text-ink">
                    {new Intl.NumberFormat("en-US", {
                      style: "currency",
                      currency: deal.currency,
                      maximumFractionDigits: 0,
                    }).format(deal.value)}
                  </span>
                  <Badge tone={stageTone[deal.stage] ?? "neutral"}>{stageLabels[deal.stage] ?? deal.stage}</Badge>
                </div>
              </li>
            ))}
          </ul>
        )}
      </CardBody>
    </Card>
  );
}
