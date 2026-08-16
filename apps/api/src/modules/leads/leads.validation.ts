import { z } from "zod";

export const leadStatusEnum = z.enum(["NEW", "CONTACTED", "QUALIFIED", "DISQUALIFIED"]);

export const listLeadsQuerySchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  pageSize: z.coerce.number().int().min(1).max(100).default(20),
  search: z.string().trim().max(200).optional(),
  status: leadStatusEnum.optional(),
  assignedTo: z.string().optional(),
  unassigned: z.coerce.boolean().optional(),
  sortBy: z.enum(["score", "createdAt", "updatedAt", "status"]).default("createdAt"),
  sortDir: z.enum(["asc", "desc"]).default("desc"),
});
export type ListLeadsQuery = z.infer<typeof listLeadsQuerySchema>;

export const createLeadSchema = z.object({
  customerId: z.string().min(1, "Select a customer"),
  source: z.string().max(100).optional().or(z.literal("")),
  status: leadStatusEnum.default("NEW"),
  score: z.coerce.number().int().min(0).max(100).default(0),
  assignedTo: z.string().optional(), // only honored for Admin/Sales Manager callers
});
export type CreateLeadInput = z.infer<typeof createLeadSchema>;

export const updateLeadSchema = z.object({
  source: z.string().max(100).optional().or(z.literal("")),
  status: leadStatusEnum.optional(),
  score: z.coerce.number().int().min(0).max(100).optional(),
  assignedTo: z.string().nullable().optional(),
});
export type UpdateLeadInput = z.infer<typeof updateLeadSchema>;

export const assignLeadSchema = z.object({
  assignedTo: z.string().nullable(),
});
export type AssignLeadInput = z.infer<typeof assignLeadSchema>;
