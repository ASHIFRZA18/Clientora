import type { LucideIcon } from "lucide-react";
import { ArrowDownRight, ArrowUpRight } from "lucide-react";
import { motion } from "framer-motion";
import { Card, CardBody } from "@/components/ui/Card";
import { cn } from "@/lib/utils";

export function StatCard({
  label,
  value,
  changePct,
  icon: Icon,
  format = "number",
  delay = 0,
}: {
  label: string;
  value: number;
  changePct: number | null;
  icon: LucideIcon;
  format?: "number" | "currency";
  delay?: number;
}) {
  const formatted =
    format === "currency"
      ? new Intl.NumberFormat("en-US", { style: "currency", currency: "USD", maximumFractionDigits: 0 }).format(
          value
        )
      : new Intl.NumberFormat("en-US").format(value);

  const isUp = (changePct ?? 0) >= 0;

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, delay }}
    >
      <Card>
        <CardBody className="space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-muted uppercase tracking-wide">{label}</span>
            <div className="h-7 w-7 rounded-md bg-primary-50 flex items-center justify-center">
              <Icon className="h-3.5 w-3.5 text-primary" strokeWidth={2} />
            </div>
          </div>
          <div className="flex items-end justify-between">
            <span className="text-2xl font-semibold text-ink tracking-tight">{formatted}</span>
            {changePct !== null && (
              <span
                className={cn(
                  "flex items-center gap-0.5 text-xs font-medium",
                  isUp ? "text-success" : "text-danger"
                )}
              >
                {isUp ? <ArrowUpRight className="h-3.5 w-3.5" /> : <ArrowDownRight className="h-3.5 w-3.5" />}
                {Math.abs(changePct)}%
              </span>
            )}
          </div>
          <p className="text-[11px] text-muted">vs. last month</p>
        </CardBody>
      </Card>
    </motion.div>
  );
}
