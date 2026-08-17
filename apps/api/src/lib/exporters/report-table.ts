export interface ReportColumn {
  key: string;
  header: string;
  /** How to render a cell's raw value as display text. Defaults to String(value). */
  format?: (value: unknown) => string;
  align?: "left" | "right";
}

export interface ReportTable {
  title: string;
  generatedAt: Date;
  /** Short label/value pairs shown above the table, e.g. "Total Revenue: $42,000". */
  summary: { label: string; value: string }[];
  columns: ReportColumn[];
  rows: Record<string, unknown>[];
}

export function cellText(col: ReportColumn, row: Record<string, unknown>): string {
  const raw = row[col.key];
  if (raw === null || raw === undefined) return "—";
  return col.format ? col.format(raw) : String(raw);
}
