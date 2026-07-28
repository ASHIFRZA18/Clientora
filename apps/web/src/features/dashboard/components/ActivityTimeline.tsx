import { Activity as ActivityIcon, CheckSquare, Handshake, Target, Users } from "lucide-react";
import { Card, CardHeader, CardBody } from "@/components/ui/Card";
import type { DashboardOverview } from "../types";

const relatedIcon: Record<string, typeof ActivityIcon> = {
  CUSTOMER: Users,
  LEAD: Target,
  DEAL: Handshake,
  TASK: CheckSquare,
};

function describeActivity(item: DashboardOverview["activity"][number]) {
  if (item.type.startsWith("deal.won")) return "closed a deal — won";
  if (item.type.startsWith("deal.lost")) return "marked a deal lost";
  if (item.type.startsWith("deal.")) return "updated a deal";
  return item.type.replace(/[._]/g, " ");
}

function timeAgo(iso: string) {
  const diffMs = Date.now() - new Date(iso).getTime();
  const mins = Math.floor(diffMs / 60000);
  if (mins < 1) return "just now";
  if (mins < 60) return `${mins}m ago`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  return `${days}d ago`;
}

export function ActivityTimeline({ items }: { items: DashboardOverview["activity"] }) {
  return (
    <Card>
      <CardHeader>
        <span className="text-sm font-medium text-ink">Recent activity</span>
      </CardHeader>
      <CardBody>
        {items.length === 0 ? (
          <p className="text-sm text-muted">No recent activity.</p>
        ) : (
          <ol className="space-y-3">
            {items.map((item) => {
              const Icon = relatedIcon[item.relatedType] ?? ActivityIcon;
              return (
                <li key={item.id} className="flex gap-2.5">
                  <div className="h-6 w-6 rounded-full bg-primary-50 flex items-center justify-center shrink-0 mt-0.5">
                    <Icon className="h-3 w-3 text-primary" strokeWidth={2} />
                  </div>
                  <div className="min-w-0">
                    <p className="text-sm text-ink">
                      <span className="font-medium">{item.actorName}</span> {describeActivity(item)}
                    </p>
                    <p className="text-xs text-muted">{timeAgo(item.createdAt)}</p>
                  </div>
                </li>
              );
            })}
          </ol>
        )}
      </CardBody>
    </Card>
  );
}
