import { apiClient } from "@/lib/api-client";
import type { ReportType, ReportFormat, ReportTable, ReportQuery } from "../types";

export async function getReport(type: ReportType, query: ReportQuery): Promise<ReportTable> {
  const { data } = await apiClient.get<{ data: ReportTable }>(`/reports/${type}`, {
    params: { ...query, format: "json" },
  });
  return data.data;
}

function filenameFromDisposition(disposition: string | undefined, fallback: string): string {
  const match = disposition?.match(/filename="?([^"]+)"?/);
  return match?.[1] ?? fallback;
}

/**
 * Downloads a CSV/XLSX/PDF export. Uses axios (not a plain <a href>) because the
 * endpoint requires the Authorization header — a browser navigation can't attach one.
 */
export async function downloadReport(type: ReportType, query: ReportQuery, format: Exclude<ReportFormat, "json">) {
  const response = await apiClient.get(`/reports/${type}`, {
    params: { ...query, format },
    responseType: "blob",
  });

  const filename = filenameFromDisposition(response.headers["content-disposition"], `${type}-report.${format}`);
  const url = window.URL.createObjectURL(response.data as Blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  link.remove();
  window.URL.revokeObjectURL(url);
}
