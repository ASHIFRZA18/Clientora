import ExcelJS from "exceljs";
import type { ReportTable } from "./report-table.js";
import { cellText } from "./report-table.js";

export async function toXlsx(table: ReportTable): Promise<Buffer> {
  const workbook = new ExcelJS.Workbook();
  workbook.creator = "Meridian CRM";
  workbook.created = table.generatedAt;

  const sheet = workbook.addWorksheet(table.title.slice(0, 31), {
    views: [{ state: "frozen", ySplit: table.summary.length > 0 ? table.summary.length + 2 : 1 }],
  });

  sheet.addRow([table.title]).font = { bold: true, size: 14 };
  sheet.addRow([`Generated ${table.generatedAt.toLocaleString()}`]).font = { italic: true, color: { argb: "FF64748B" } };
  sheet.addRow([]);

  if (table.summary.length > 0) {
    for (const item of table.summary) {
      const row = sheet.addRow([item.label, item.value]);
      row.getCell(1).font = { color: { argb: "FF64748B" } };
      row.getCell(2).font = { bold: true };
    }
    sheet.addRow([]);
  }

  const headerRow = sheet.addRow(table.columns.map((c) => c.header));
  headerRow.eachCell((cell) => {
    cell.font = { bold: true, color: { argb: "FFFFFFFF" } };
    cell.fill = { type: "pattern", pattern: "solid", fgColor: { argb: "FF2563EB" } };
    cell.alignment = { vertical: "middle" };
  });

  for (const row of table.rows) {
    const dataRow = sheet.addRow(table.columns.map((c) => cellText(c, row)));
    table.columns.forEach((col, i) => {
      if (col.align === "right") dataRow.getCell(i + 1).alignment = { horizontal: "right" };
    });
  }

  sheet.columns.forEach((col, i) => {
    const header = table.columns[i]?.header ?? "";
    const longestCell = table.rows.reduce((max, row) => {
      const text = cellText(table.columns[i], row);
      return Math.max(max, text.length);
    }, header.length);
    col.width = Math.min(Math.max(longestCell + 2, 12), 40);
  });

  const buffer = await workbook.xlsx.writeBuffer();
  return Buffer.from(buffer);
}
