import { Bar, BarChart, CartesianGrid, Cell, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { Card, CardHeader, CardBody } from "@/components/ui/Card";

const stageLabels: Record<string, string> = {
  NEW_LEAD: "New Lead",
  CONTACTED: "Contacted",
  QUALIFIED: "Qualified",
  PROPOSAL_SENT: "Proposal Sent",
  NEGOTIATION: "Negotiation",
  WON: "Won",
  LOST: "Lost",
};

const stageColors: Record<string, string> = {
  NEW_LEAD: "#94A3B8",
  CONTACTED: "#60A5FA",
  QUALIFIED: "#2563EB",
  PROPOSAL_SENT: "#06B6D4",
  NEGOTIATION: "#F59E0B",
  WON: "#22C55E",
  LOST: "#EF4444",
};

export function FunnelChart({ data }: { data: { stage: string; count: number }[] }) {
  const chartData = data.map((d) => ({ ...d, label: stageLabels[d.stage] ?? d.stage }));

  return (
    <Card>
      <CardHeader>
        <span className="text-sm font-medium text-ink">Sales pipeline</span>
        <p className="text-xs text-muted mt-0.5">Open and closed deals by stage</p>
      </CardHeader>
      <CardBody className="h-64">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={chartData} layout="vertical" margin={{ top: 4, right: 16, left: 8, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#E2E8F0" horizontal={false} />
            <XAxis type="number" tickLine={false} axisLine={false} tick={{ fontSize: 12, fill: "#64748B" }} />
            <YAxis
              type="category"
              dataKey="label"
              tickLine={false}
              axisLine={false}
              tick={{ fontSize: 12, fill: "#0F172A" }}
              width={90}
            />
            <Tooltip
              contentStyle={{
                borderRadius: 10,
                border: "1px solid #E2E8F0",
                fontSize: 12,
                boxShadow: "0 8px 24px -6px rgb(15 23 42 / 0.10)",
              }}
            />
            <Bar dataKey="count" radius={[0, 4, 4, 0]} barSize={16}>
              {chartData.map((entry) => (
                <Cell key={entry.stage} fill={stageColors[entry.stage] ?? "#94A3B8"} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </CardBody>
    </Card>
  );
}
