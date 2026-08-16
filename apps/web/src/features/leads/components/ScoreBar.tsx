import { cn } from "@/lib/utils";

function toneFor(score: number) {
  if (score >= 70) return "bg-success";
  if (score >= 40) return "bg-warning";
  return "bg-danger";
}

export function ScoreBar({ score, className }: { score: number; className?: string }) {
  return (
    <div className={cn("flex items-center gap-2", className)}>
      <div className="w-16 h-1.5 rounded-full bg-slate-100 overflow-hidden">
        <div className={cn("h-full rounded-full", toneFor(score))} style={{ width: `${score}%` }} />
      </div>
      <span className="text-xs font-medium text-ink tabular-nums">{score}</span>
    </div>
  );
}
