import { z } from "zod";
import { completeWithClaude, AiRequestError } from "../../lib/anthropic-client.js";
import { calculateLeadScore } from "../../lib/lead-scoring.js";

const aiInsightSchema = z.object({
  score: z.number().int().min(0).max(100),
  confidence: z.enum(["low", "medium", "high"]),
  reasoning: z.string().min(1).max(600),
  suggestedAction: z.string().min(1).max(200),
});
export type AiLeadInsight = z.infer<typeof aiInsightSchema>;

const SYSTEM_PROMPT = `You are a sales operations analyst embedded in a CRM. Given details about a sales lead, assess how likely it is to convert and recommend a next action.

Respond with ONLY a JSON object — no markdown fences, no preamble, no explanation outside the JSON. The object must match exactly this shape:
{"score": <integer 0-100>, "confidence": "low"|"medium"|"high", "reasoning": "<2-3 sentences on why this lead scores where it does>", "suggestedAction": "<one concrete, specific next step for the sales rep>"}

Score based on genuine signals in the data provided (source quality, engagement recency, deal value, pipeline status) — do not simply restate the rule-based score if you disagree with it. Be direct and specific; avoid generic advice like "follow up soon".`;

interface LeadContext {
  source: string | null;
  status: string;
  ruleBasedScore: number;
  createdAt: Date;
  customerName: string;
  customerCompany: string | null;
  assigneeName: string | null;
  dealCount: number;
  dealValueTotal: number;
  noteCount: number;
}

function buildPrompt(ctx: LeadContext): string {
  const ageDays = Math.floor((Date.now() - ctx.createdAt.getTime()) / (1000 * 60 * 60 * 24));
  return [
    `Lead for: ${ctx.customerName}${ctx.customerCompany ? ` (${ctx.customerCompany})` : ""}`,
    `Source: ${ctx.source ?? "unknown"}`,
    `Pipeline status: ${ctx.status}`,
    `Age: ${ageDays} day${ageDays === 1 ? "" : "s"} since captured`,
    `Assigned to: ${ctx.assigneeName ?? "unassigned"}`,
    `Linked deals: ${ctx.dealCount} (combined value $${ctx.dealValueTotal.toLocaleString()})`,
    `Customer notes on file: ${ctx.noteCount}`,
    `Current rule-based score (source + status + recency heuristic): ${ctx.ruleBasedScore}/100`,
  ].join("\n");
}

/**
 * Calls Claude for a qualitative assessment of a lead. Falls back to the
 * deterministic rule-based score (with a "low" confidence label) if the
 * model's response can't be parsed — the UI should never show nothing.
 */
export async function getAiLeadInsight(ctx: LeadContext): Promise<AiLeadInsight> {
  const raw = await completeWithClaude({
    system: SYSTEM_PROMPT,
    prompt: buildPrompt(ctx),
    maxTokens: 400,
  });

  let parsed: unknown;
  try {
    // Models occasionally wrap JSON in ```json fences despite instructions — strip defensively.
    const cleaned = raw.trim().replace(/^```(?:json)?\s*/i, "").replace(/```\s*$/i, "");
    parsed = JSON.parse(cleaned);
  } catch {
    throw new AiRequestError("Could not parse the AI response as JSON");
  }

  const result = aiInsightSchema.safeParse(parsed);
  if (!result.success) {
    throw new AiRequestError("AI response did not match the expected shape");
  }

  return result.data;
}

/** Used only if the caller wants a guaranteed-available fallback without calling the API. */
export function ruleBasedFallback(ctx: Pick<LeadContext, "source" | "status" | "createdAt">): AiLeadInsight {
  return {
    score: calculateLeadScore(ctx),
    confidence: "low",
    reasoning: "AI analysis unavailable — showing the rule-based score instead.",
    suggestedAction: "Try AI analysis again once the service is configured.",
  };
}
