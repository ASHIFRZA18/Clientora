import { AlertCircle, Loader2, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { ScoreBar } from "./ScoreBar";
import { useAiLeadInsight } from "../hooks";
import { getErrorMessage, getErrorCode } from "@/lib/get-error-message";
import type { LeadDetail } from "../types";

const confidenceTone = { low: "neutral", medium: "accent", high: "success" } as const;

function timeAgo(iso: string) {
  const diffMs = Date.now() - new Date(iso).getTime();
  const mins = Math.floor(diffMs / 60000);
  if (mins < 1) return "just now";
  if (mins < 60) return `${mins}m ago`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours}h ago`;
  return `${Math.floor(hours / 24)}d ago`;
}

export function AiInsightCard({ lead }: { lead: LeadDetail }) {
  const aiInsight = useAiLeadInsight(lead.id);

  const errorCode = getErrorCode(aiInsight.error);
  const errorMessage = getErrorMessage(aiInsight.error, "AI analysis failed. Please try again.");
  const isNotConfigured = errorCode === "AI_NOT_CONFIGURED";

  const hasInsight = lead.aiScore !== null && lead.aiScoredAt !== null;

  return (
    <div className="rounded-md border border-line bg-gradient-to-b from-primary-50/40 to-transparent p-3 space-y-2.5">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-1.5">
          <Sparkles className="h-3.5 w-3.5 text-primary" />
          <span className="text-xs font-medium text-muted uppercase tracking-wide">AI Insight</span>
        </div>
        <Button
          variant="outline"
          size="sm"
          onClick={() => aiInsight.mutate()}
          disabled={aiInsight.isPending}
          className="h-6 px-1.5 text-xs"
        >
          {aiInsight.isPending && <Loader2 className="h-3 w-3 animate-spin" />}
          {hasInsight ? "Re-analyze" : "Analyze with AI"}
        </Button>
      </div>

      {aiInsight.isError && (
        <div className="flex items-start gap-1.5 rounded-md bg-danger/10 px-2.5 py-2 text-xs text-danger">
          <AlertCircle className="h-3.5 w-3.5 mt-0.5 shrink-0" />
          <span>
            {isNotConfigured
              ? "AI scoring isn't set up for this environment yet — add ANTHROPIC_API_KEY to the API's .env to enable it."
              : errorMessage}
          </span>
        </div>
      )}

      {hasInsight && !aiInsight.isPending && (
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <ScoreBar score={lead.aiScore!} />
            {lead.aiConfidence && (
              <Badge tone={confidenceTone[lead.aiConfidence]}>{lead.aiConfidence} confidence</Badge>
            )}
          </div>
          {lead.aiReasoning && <p className="text-sm text-ink leading-snug">{lead.aiReasoning}</p>}
          {lead.aiSuggestedAction && (
            <div className="rounded-md bg-surface border border-line px-2.5 py-2">
              <p className="text-[11px] font-medium text-muted uppercase tracking-wide mb-0.5">Suggested next step</p>
              <p className="text-sm text-ink">{lead.aiSuggestedAction}</p>
            </div>
          )}
          {lead.aiScoredAt && <p className="text-[11px] text-muted">Analyzed {timeAgo(lead.aiScoredAt)}</p>}
        </div>
      )}

      {!hasInsight && !aiInsight.isError && !aiInsight.isPending && (
        <p className="text-xs text-muted">
          Get a qualitative read on this lead — likelihood to convert, reasoning, and a concrete next step.
        </p>
      )}
    </div>
  );
}
