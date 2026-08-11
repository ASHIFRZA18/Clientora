import { z } from "zod";

export const dealStageEnum = z.enum([
  "NEW_LEAD",
  "CONTACTED",
  "QUALIFIED",
  "PROPOSAL_SENT",
  "NEGOTIATION",
  "WON",
  "LOST",
]);
export type DealStage = z.infer<typeof dealStageEnum>;

export const createDealSchema = z.object({
  title: z.string().min(1, "Title is required").max(200),
  customerId: z.string().min(1, "Select a customer"),
  leadId: z.string().optional(),
  stage: dealStageEnum.default("NEW_LEAD"),
  value: z.coerce.number().min(0).max(100_000_000),
  currency: z.string().length(3).default("USD"),
  expectedCloseDate: z.coerce.date().optional(),
  ownerId: z.string().optional(), // only honored for Admin/Sales Manager callers
});
export type CreateDealInput = z.infer<typeof createDealSchema>;

export const updateDealSchema = z.object({
  title: z.string().min(1).max(200).optional(),
  value: z.coerce.number().min(0).max(100_000_000).optional(),
  currency: z.string().length(3).optional(),
  expectedCloseDate: z.coerce.date().nullable().optional(),
  ownerId: z.string().optional(),
});
export type UpdateDealInput = z.infer<typeof updateDealSchema>;

export const moveDealSchema = z.object({
  toStage: dealStageEnum,
  /** Zero-based position within the destination column after the move. */
  toIndex: z.coerce.number().int().min(0),
});
export type MoveDealInput = z.infer<typeof moveDealSchema>;
