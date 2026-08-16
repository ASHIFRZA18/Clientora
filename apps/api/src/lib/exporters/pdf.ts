import PDFDocument from "pdfkit";
import type { ReportTable } from "./report-table.js";
import { cellText } from "./report-table.js";

const INK = "#0F172A";
const MUTED = "#64748B";
const PRIMARY = "#2563EB";
const BORDER = "#E2E8F0";

export async function toPdf(table: ReportTable): Promise<Buffer> {
  return new Promise((resolve, reject) => {
    const doc = new PDFDocument({ size: "A4", margin: 40, bufferPages: true });
    const chunks: Buffer[] = [];
    doc.on("data", (chunk) => chunks.push(chunk));
    doc.on("end", () => resolve(Buffer.concat(chunks)));
    doc.on("error", reject);

    const pageWidth = doc.page.width - doc.page.margins.left - doc.page.margins.right;

    // Header
    doc.fillColor(PRIMARY).font("Helvetica-Bold").fontSize(9).text("MERIDIAN CRM", { continued: false });
    doc.moveDown(0.3);
    doc.fillColor(INK).font("Helvetica-Bold").fontSize(18).text(table.title);
    doc.fillColor(MUTED).font("Helvetica").fontSize(9).text(`Generated ${table.generatedAt.toLocaleString()}`);
    doc.moveDown(1);

    // Summary strip
    if (table.summary.length > 0) {
      const boxY = doc.y;
      const boxWidth = pageWidth / table.summary.length;
      table.summary.forEach((item, i) => {
        const x = doc.page.margins.left + i * boxWidth;
        doc.fillColor(MUTED).font("Helvetica").fontSize(8).text(item.label.toUpperCase(), x, boxY, { width: boxWidth - 10 });
        doc.fillColor(INK).font("Helvetica-Bold").fontSize(13).text(item.value, x, boxY + 12, { width: boxWidth - 10 });
      });
      doc.y = boxY + 40;
      doc.moveDown(1);
    }

    // Table
    const colCount = table.columns.length;
    const colWidth = pageWidth / colCount;
    const rowHeight = 20;

    function drawHeader() {
      const y = doc.y;
      doc.rect(doc.page.margins.left, y, pageWidth, rowHeight).fill(PRIMARY);
      table.columns.forEach((col, i) => {
        doc
          .fillColor("#FFFFFF")
          .font("Helvetica-Bold")
          .fontSize(8)
          .text(col.header, doc.page.margins.left + i * colWidth + 6, y + 6, {
            width: colWidth - 10,
            align: col.align ?? "left",
          });
      });
      doc.y = y + rowHeight;
    }

    drawHeader();

    table.rows.forEach((row, rowIndex) => {
      if (doc.y + rowHeight > doc.page.height - doc.page.margins.bottom) {
        doc.addPage();
        doc.y = doc.page.margins.top;
        drawHeader();
      }

      const y = doc.y;
      if (rowIndex % 2 === 0) {
        doc.rect(doc.page.margins.left, y, pageWidth, rowHeight).fill("#F8FAFC");
      }
      table.columns.forEach((col, i) => {
        doc
          .fillColor(INK)
          .font("Helvetica")
          .fontSize(8)
          .text(cellText(col, row), doc.page.margins.left + i * colWidth + 6, y + 6, {
            width: colWidth - 10,
            align: col.align ?? "left",
          });
      });
      doc.y = y + rowHeight;
      doc
        .moveTo(doc.page.margins.left, doc.y)
        .lineTo(doc.page.margins.left + pageWidth, doc.y)
        .strokeColor(BORDER)
        .lineWidth(0.5)
        .stroke();
    });

    if (table.rows.length === 0) {
      doc.moveDown(1);
      doc.fillColor(MUTED).font("Helvetica").fontSize(9).text("No data in the selected range.");
    }

    // Page numbers
    const pageCount = doc.bufferedPageRange().count;
    for (let i = 0; i < pageCount; i++) {
      doc.switchToPage(i);
      doc
        .fillColor(MUTED)
        .font("Helvetica")
        .fontSize(8)
        .text(`Page ${i + 1} of ${pageCount}`, doc.page.margins.left, doc.page.height - 30, {
          width: pageWidth,
          align: "center",
        });
    }

    doc.end();
  });
}
