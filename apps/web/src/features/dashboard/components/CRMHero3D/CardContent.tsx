import { ArrowUpRight, Handshake, Target, TrendingUp, Users, Workflow } from "lucide-react";

export function CustomerCardContent() {
  return (
    <div className="flex items-start gap-2">
      <div className="h-7 w-7 rounded-full bg-primary text-white text-xs font-semibold flex items-center justify-center shrink-0">
        AR
      </div>
      <div className="min-w-0">
        <p className="text-xs font-semibold text-ink truncate">Aria Reyes</p>
        <p className="text-[11px] text-muted truncate">Northwind Co.</p>
        <span className="mt-1 inline-block text-[10px] font-medium text-success bg-success/10 rounded-full px-1.5 py-0.5">
          Active
        </span>
      </div>
    </div>
  );
}

export function LeadCardContent() {
  return (
    <div>
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-1.5">
          <Target className="h-3 w-3 text-primary" />
          <span className="text-[11px] font-medium text-muted">Lead score</span>
        </div>
        <span className="text-xs font-semibold text-ink">86</span>
      </div>
      <div className="mt-1.5 h-1.5 rounded-full bg-primary-50 overflow-hidden">
        <div className="h-full w-[86%] rounded-full bg-primary" />
      </div>
      <p className="mt-1.5 text-[11px] text-muted">Qualified · Devon Park</p>
    </div>
  );
}

export function DealCardContent() {
  return (
    <div className="flex items-start gap-2">
      <div className="h-7 w-7 rounded-md bg-primary-50 flex items-center justify-center shrink-0">
        <Handshake className="h-3.5 w-3.5 text-primary" />
      </div>
      <div className="min-w-0">
        <p className="text-xs font-semibold text-ink truncate">Enterprise plan</p>
        <p className="text-[11px] text-muted">$42,000</p>
        <span className="mt-1 inline-block text-[10px] font-medium text-warning bg-warning/10 rounded-full px-1.5 py-0.5">
          Negotiation
        </span>
      </div>
    </div>
  );
}

export function RevenueCardContent() {
  return (
    <div>
      <div className="flex items-center gap-1.5">
        <TrendingUp className="h-3 w-3 text-success" />
        <span className="text-[11px] font-medium text-muted">Revenue</span>
      </div>
      <p className="text-base font-bold text-ink mt-0.5 leading-none">$128.4K</p>
      <p className="mt-1 flex items-center gap-0.5 text-[11px] font-medium text-success">
        <ArrowUpRight className="h-3 w-3" />
        +18.6%
      </p>
    </div>
  );
}

export function PipelineCardContent() {
  const stages = ["New", "Qualified", "Proposal", "Negotiation", "Won"];
  return (
    <div className="w-[220px]">
      <div className="flex items-center gap-1.5 mb-1.5">
        <Workflow className="h-3 w-3 text-primary" />
        <span className="text-[11px] font-medium text-muted">Sales pipeline</span>
      </div>
      <div className="flex items-center">
        {stages.map((stage, i) => (
          <div key={stage} className="flex items-center flex-1">
            <div
              className={
                "h-1.5 flex-1 rounded-full " +
                (i <= 2 ? "bg-primary" : "bg-primary-100")
              }
            />
            {i < stages.length - 1 && <div className="h-1 w-1 rounded-full bg-primary-100 mx-0.5 shrink-0" />}
          </div>
        ))}
      </div>
      <p className="mt-1.5 text-[11px] text-muted">Proposal · 3 deals</p>
    </div>
  );
}

export function nodeIconFor(kind: "customer" | "lead" | "deal" | "revenue" | "pipeline") {
  switch (kind) {
    case "customer":
      return Users;
    case "lead":
      return Target;
    case "deal":
      return Handshake;
    case "revenue":
      return TrendingUp;
    case "pipeline":
      return Workflow;
  }
}
