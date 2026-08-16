const SOURCE_WEIGHTS: Record<string, number> = {
  referral: 35,
  website: 22,
  "trade show": 18,
  webinar: 15,
  "cold call": 8,
  "cold email": 6,
};

const STATUS_WEIGHTS: Record<string, number> = {
  QUALIFIED: 30,
  CONTACTED: 12,
  NEW: 0,
  DISQUALIFIED: -40,
};

/**
 * Deterministic, explainable scoring rules used until Phase 9 introduces a real
 * model. Kept as a pure function so the AI scorer can later call it as a
 * fallback/floor rather than replacing it outright.
 */
export function calculateLeadScore(input: {
  source?: string | null;
  status: string;
  createdAt: Date;
}): number {
  let score = 10; // baseline for any captured lead

  if (input.source) {
    score += SOURCE_WEIGHTS[input.source.trim().toLowerCase()] ?? 10;
  }

  score += STATUS_WEIGHTS[input.status] ?? 0;

  const ageDays = (Date.now() - input.createdAt.getTime()) / (1000 * 60 * 60 * 24);
  if (ageDays <= 2) score += 20;
  else if (ageDays <= 7) score += 12;
  else if (ageDays <= 30) score += 4;
  // older, untouched leads get no recency bonus — they naturally cool off

  return Math.max(0, Math.min(100, Math.round(score)));
}
