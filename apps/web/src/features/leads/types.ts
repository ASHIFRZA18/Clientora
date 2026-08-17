export type LeadStatus = "NEW" | "CONTACTED" | "QUALIFIED" | "DISQUALIFIED";

export interface Lead {
  id: string;
  customerId: string;
  customer: { id: string; name: string; company: string | null };
  source: string | null;
  status: LeadStatus;
  score: number;
  assignedTo: string | null;
  assignee: { id: string; name: string } | null;
  createdAt: string;
  updatedAt: string;
}

export type AiConfidence = "low" | "medium" | "high";

export interface LeadDetail extends Lead {
  deals: { id: string; title: string; stage: string; value: string }[];
  aiScore: number | null;
  aiConfidence: AiConfidence | null;
  aiReasoning: string | null;
  aiSuggestedAction: string | null;
  aiScoredAt: string | null;
}

export interface Paginated<T> {
  data: T[];
  meta: { page: number; pageSize: number; total: number; totalPages: number };
}

export interface ListLeadsParams {
  page: number;
  pageSize: number;
  search?: string;
  status?: LeadStatus;
  unassigned?: boolean;
  sortBy: "score" | "createdAt" | "updatedAt" | "status";
  sortDir: "asc" | "desc";
}
