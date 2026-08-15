import { z } from "zod";

export const dealFormSchema = z.object({
  title: z.string().min(1, "Title is required").max(200),
  customerId: z.string().min(1, "Select a customer"),
  value: z.coerce.number().min(0, "Enter a value"),
  currency: z.string().length(3).default("USD"),
  expectedCloseDate: z.string().optional().or(z.literal("")),
});
export type DealFormValues = z.infer<typeof dealFormSchema>;
