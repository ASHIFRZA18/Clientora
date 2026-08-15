export type ReportType = "revenue" | "leads" | "customers" | "performance";
export type ReportFormat = "json" | "csv" | "xlsx" | "pdf";

export interface ReportColumn {
  key: string;
  header: string;
  align?: "left" | "right";
}

export interface ReportSummaryItem {
  label: string;
  value: string;
}

export interface ReportTable {
  title: string;
  generatedAt: string;
  summary: ReportSummaryItem[];
  columns: ReportColumn[];
  /** Every cell arrives as a pre-formatted display string (money, dates, percents already rendered server-side). */
  rows: Record<string, string>[];
}

export interface ReportQuery {
  from?: string;
  to?: string;
}
