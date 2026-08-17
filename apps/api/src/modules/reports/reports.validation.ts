import { z } from "zod";

export const reportTypeEnum = z.enum(["revenue", "leads", "customers", "performance"]);
export type ReportType = z.infer<typeof reportTypeEnum>;

export const reportFormatEnum = z.enum(["json", "csv", "xlsx", "pdf"]);
export type ReportFormat = z.infer<typeof reportFormatEnum>;

export const reportQuerySchema = z.object({
  from: z.coerce.date().optional(),
  to: z.coerce.date().optional(),
  ownerId: z.string().optional(),
  format: reportFormatEnum.default("json"),
});
export type ReportQuery = z.infer<typeof reportQuerySchema>;
