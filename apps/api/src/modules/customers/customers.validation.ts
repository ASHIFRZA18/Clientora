import { z } from "zod";

export const listCustomersQuerySchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  pageSize: z.coerce.number().int().min(1).max(100).default(20),
  search: z.string().trim().max(200).optional(),
  status: z.enum(["active", "inactive"]).optional(),
  ownerId: z.string().optional(),
  sortBy: z.enum(["name", "company", "createdAt", "updatedAt"]).default("createdAt"),
  sortDir: z.enum(["asc", "desc"]).default("desc"),
});
export type ListCustomersQuery = z.infer<typeof listCustomersQuerySchema>;

export const createCustomerSchema = z.object({
  name: z.string().min(1, "Name is required").max(150),
  company: z.string().max(150).optional(),
  email: z.string().email().optional().or(z.literal("")),
  phone: z.string().max(40).optional(),
  status: z.enum(["active", "inactive"]).default("active"),
  ownerId: z.string().optional(), // only honored for Admin/Sales Manager callers
});
export type CreateCustomerInput = z.infer<typeof createCustomerSchema>;

export const updateCustomerSchema = createCustomerSchema.partial();
export type UpdateCustomerInput = z.infer<typeof updateCustomerSchema>;

export const createNoteSchema = z.object({
  body: z.string().min(1, "Note can't be empty").max(4000),
});
