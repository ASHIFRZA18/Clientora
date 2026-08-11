import { z } from "zod";

export const customerFormSchema = z.object({
  name: z.string().min(1, "Name is required").max(150),
  company: z.string().max(150).optional().or(z.literal("")),
  email: z.string().email("Enter a valid email").optional().or(z.literal("")),
  phone: z.string().max(40).optional().or(z.literal("")),
  status: z.enum(["active", "inactive"]),
});
export type CustomerFormValues = z.infer<typeof customerFormSchema>;

export const noteFormSchema = z.object({
  body: z.string().min(1, "Note can't be empty").max(4000),
});
export type NoteFormValues = z.infer<typeof noteFormSchema>;
