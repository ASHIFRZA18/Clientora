import { z } from "zod";

export const leadStatusOptions = ["NEW", "CONTACTED", "QUALIFIED", "DISQUALIFIED"] as const;

export const leadFormSchema = z.object({
  customerId: z.string().min(1, "Select a customer"),
  source: z.string().max(100).optional().or(z.literal("")),
  status: z.enum(leadStatusOptions),
  score: z.coerce.number().int().min(0).max(100),
});
export type LeadFormValues = z.infer<typeof leadFormSchema>;
