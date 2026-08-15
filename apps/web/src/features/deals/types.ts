export type DealStage =
  | "NEW_LEAD"
  | "CONTACTED"
  | "QUALIFIED"
  | "PROPOSAL_SENT"
  | "NEGOTIATION"
  | "WON"
  | "LOST";

export interface Deal {
  id: string;
  title: string;
  customerId: string;
  customer: { id: string; name: string; company: string | null };
  leadId: string | null;
  stage: DealStage;
  order: number;
  value: string;
  currency: string;
  ownerId: string;
  owner: { id: string; name: string };
  expectedCloseDate: string | null;
  closedAt: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface DealDetail extends Deal {
  lead: { id: string; source: string | null } | null;
}

export interface BoardColumn {
  stage: DealStage;
  deals: Deal[];
  totalValue: number;
}

export type Board = BoardColumn[];
