import { reportsRepository, type DateRange } from "./reports.repository.js";
import { toCsv } from "../../lib/exporters/csv.js";
import { toXlsx } from "../../lib/exporters/xlsx.js";
import { toPdf } from "../../lib/exporters/pdf.js";
import type { ReportTable, ReportColumn } from "../../lib/exporters/report-table.js";
import { cellText } from "../../lib/exporters/report-table.js";
import { ApiError } from "../../middleware/error-handler.js";
import type { ReportType, ReportFormat } from "./reports.validation.js";

const money = (n: unknown) =>
  new Intl.NumberFormat("en-US", { style: "currency", currency: "USD", maximumFractionDigits: 0 }).format(Number(n));
const dateFmt = (d: unknown) => (d ? new Date(d as string).toLocaleDateString() : "—");
const pct = (n: number) => `${(n * 100).toFixed(1)}%`;

async function buildRevenueTable(range: DateRange): Promise<ReportTable> {
  const deals = await reportsRepository.revenueDeals(range);
  const totalValue = deals.reduce((sum: number, d: any) => sum + Number(d.value), 0);

  const columns: ReportColumn[] = [
    { key: "closedAt", header: "Closed", format: dateFmt },
    { key: "title", header: "Deal" },
    { key: "customer", header: "Customer" },
    { key: "owner", header: "Owner" },
    { key: "value", header: "Value", format: money, align: "right" },
  ];

  const rows = deals.map((d: any) => ({
    closedAt: d.closedAt,
    title: d.title,
    customer: d.customer.company ? `${d.customer.name} (${d.customer.company})` : d.customer.name,
    owner: d.owner.name,
    value: d.value,
  }));

  return {
    title: "Revenue Report",
    generatedAt: new Date(),
    summary: [
      { label: "Deals Won", value: String(deals.length) },
      { label: "Total Revenue", value: money(totalValue) },
      { label: "Avg Deal Size", value: money(deals.length ? totalValue / deals.length : 0) },
    ],
    columns,
    rows,
  };
}

async function buildLeadsTable(range: DateRange): Promise<ReportTable> {
  const leads = await reportsRepository.leads(range);
  const qualified = leads.filter((l: any) => l.status === "QUALIFIED").length;
  const avgScore = leads.length ? leads.reduce((s: number, l: any) => s + l.score, 0) / leads.length : 0;

  const columns: ReportColumn[] = [
    { key: "createdAt", header: "Created", format: dateFmt },
    { key: "customer", header: "Customer" },
    { key: "source", header: "Source" },
    { key: "status", header: "Status" },
    { key: "score", header: "Score", align: "right" },
    { key: "assignee", header: "Assigned To" },
  ];

  const rows = leads.map((l: any) => ({
    createdAt: l.createdAt,
    customer: l.customer.company ? `${l.customer.name} (${l.customer.company})` : l.customer.name,
    source: l.source ?? "—",
    status: l.status,
    score: l.score,
    assignee: l.assignee?.name ?? "Unassigned",
  }));

  return {
    title: "Lead Report",
    generatedAt: new Date(),
    summary: [
      { label: "Total Leads", value: String(leads.length) },
      { label: "Qualified", value: String(qualified) },
      { label: "Avg Score", value: avgScore.toFixed(0) },
      { label: "Qualification Rate", value: leads.length ? pct(qualified / leads.length) : "—" },
    ],
    columns,
    rows,
  };
}

async function buildCustomersTable(range: DateRange): Promise<ReportTable> {
  const customers = await reportsRepository.customers(range);
  const active = customers.filter((c: any) => c.status === "active").length;

  const columns: ReportColumn[] = [
    { key: "createdAt", header: "Created", format: dateFmt },
    { key: "name", header: "Name" },
    { key: "company", header: "Company" },
    { key: "status", header: "Status" },
    { key: "owner", header: "Owner" },
    { key: "leads", header: "Leads", align: "right" },
    { key: "deals", header: "Deals", align: "right" },
  ];

  const rows = customers.map((c: any) => ({
    createdAt: c.createdAt,
    name: c.name,
    company: c.company ?? "—",
    status: c.status,
    owner: c.owner.name,
    leads: c._count.leads,
    deals: c._count.deals,
  }));

  return {
    title: "Customer Report",
    generatedAt: new Date(),
    summary: [
      { label: "Total Customers", value: String(customers.length) },
      { label: "Active", value: String(active) },
      { label: "Inactive", value: String(customers.length - active) },
    ],
    columns,
    rows,
  };
}

async function buildPerformanceTable(range: DateRange): Promise<ReportTable> {
  const [users, deals, leads, customers] = await Promise.all([
    reportsRepository.salesUsers(),
    reportsRepository.allDealsInRange(range),
    reportsRepository.allLeadsInRange(range),
    reportsRepository.allCustomersInRange(range),
  ]);

  const relevantUsers = range.ownerId ? users.filter((u: any) => u.id === range.ownerId) : users;

  const rows: {
    owner: string;
    customers: number;
    leads: number;
    dealsWon: number;
    revenue: number;
    winRate: number | null;
  }[] = relevantUsers.map((user: any) => {
    const ownDeals = deals.filter((d: any) => d.ownerId === user.id);
    const won = ownDeals.filter((d: any) => d.stage === "WON");
    const lost = ownDeals.filter((d: any) => d.stage === "LOST");
    const closed = won.length + lost.length;
    const revenue = won.reduce((s: number, d: any) => s + Number(d.value), 0);
    return {
      owner: user.name,
      customers: customers.filter((c: any) => c.ownerId === user.id).length,
      leads: leads.filter((l: any) => l.assignedTo === user.id).length,
      dealsWon: won.length,
      revenue,
      winRate: closed ? won.length / closed : null,
    };
  });

  rows.sort((a, b) => b.revenue - a.revenue);

  const totalRevenue = rows.reduce((s, r) => s + r.revenue, 0);
  const totalWon = rows.reduce((s, r) => s + r.dealsWon, 0);

  const columns: ReportColumn[] = [
    { key: "owner", header: "Sales Rep" },
    { key: "customers", header: "Customers", align: "right" },
    { key: "leads", header: "Leads", align: "right" },
    { key: "dealsWon", header: "Deals Won", align: "right" },
    { key: "revenue", header: "Revenue Won", format: money, align: "right" },
    { key: "winRate", header: "Win Rate", format: (v) => (v === null ? "—" : pct(v as number)), align: "right" },
  ];

  return {
    title: "Employee Performance Report",
    generatedAt: new Date(),
    summary: [
      { label: "Sales Reps", value: String(rows.length) },
      { label: "Total Revenue Won", value: money(totalRevenue) },
      { label: "Total Deals Won", value: String(totalWon) },
    ],
    columns,
    rows,
  };
}

const BUILDERS: Record<ReportType, (range: DateRange) => Promise<ReportTable>> = {
  revenue: buildRevenueTable,
  leads: buildLeadsTable,
  customers: buildCustomersTable,
  performance: buildPerformanceTable,
};

export const reportsService = {
  async build(type: ReportType, range: DateRange): Promise<ReportTable> {
    return BUILDERS[type](range);
  },

  async export(type: ReportType, range: DateRange, format: ReportFormat) {
    const table = await BUILDERS[type](range);

    if (format === "json") {
      // Column `format` functions don't survive JSON.stringify, so pre-render
      // each cell to a display string here rather than shipping raw values
      // the frontend would have no formatting instructions for.
      const displayRows = table.rows.map((row) =>
        Object.fromEntries(table.columns.map((col) => [col.key, cellText(col, row)]))
      );
      const displayColumns = table.columns.map(({ key, header, align }) => ({ key, header, align }));
      return {
        kind: "json" as const,
        table: { ...table, columns: displayColumns, rows: displayRows },
      };
    }
    if (format === "csv") {
      return { kind: "file" as const, filename: `${type}-report.csv`, contentType: "text/csv", buffer: Buffer.from(toCsv(table), "utf-8") };
    }
    if (format === "xlsx") {
      return {
        kind: "file" as const,
        filename: `${type}-report.xlsx`,
        contentType: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
        buffer: await toXlsx(table),
      };
    }
    if (format === "pdf") {
      return { kind: "file" as const, filename: `${type}-report.pdf`, contentType: "application/pdf", buffer: await toPdf(table) };
    }
    throw new ApiError(400, "INVALID_FORMAT", "Unsupported export format");
  },
};
