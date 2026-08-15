import { CartesianGrid, Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { Card, CardHeader, CardBody } from "@/components/ui/Card";

export function CustomerGrowthChart({ data }: { data: { month: string; total: number }[] }) {
  return (
    <Card>
      <CardHeader>
        <span className="text-sm font-medium text-ink">Customer growth</span>
        <p className="text-xs text-muted mt-0.5">Cumulative accounts, last 6 months</p>
      </CardHeader>
      <CardBody className="h-56">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={data} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#E2E8F0" vertical={false} />
            <XAxis dataKey="month" tickLine={false} axisLine={false} tick={{ fontSize: 12, fill: "#64748B" }} />
            <YAxis tickLine={false} axisLine={false} tick={{ fontSize: 12, fill: "#64748B" }} width={30} />
            <Tooltip
              contentStyle={{
                borderRadius: 10,
                border: "1px solid #E2E8F0",
                fontSize: 12,
                boxShadow: "0 8px 24px -6px rgb(15 23 42 / 0.10)",
              }}
            />
            <Line
              type="monotone"
              dataKey="total"
              stroke="#06B6D4"
              strokeWidth={2}
              dot={{ r: 3, fill: "#06B6D4", strokeWidth: 0 }}
              activeDot={{ r: 5 }}
            />
          </LineChart>
        </ResponsiveContainer>
      </CardBody>
    </Card>
  );
}
