import type { ReportTable } from "./report-table.js";
import { cellText } from "./report-table.js";

function escapeCsvCell(text: string): string {
  if (/[",\n]/.test(text)) {
    return `"${text.replace(/"/g, '""')}"`;
  }
  return text;
}

export function toCsv(table: ReportTable): string {
  const lines: string[] = [];
  lines.push(table.columns.map((c) => escapeCsvCell(c.header)).join(","));
  for (const row of table.rows) {
    lines.push(table.columns.map((c) => escapeCsvCell(cellText(c, row))).join(","));
  }
  return lines.join("\r\n");
}
