import { useMutation, useQuery } from "@tanstack/react-query";
import { getReport, downloadReport } from "./api/reports.api";
import type { ReportType, ReportFormat, ReportQuery } from "./types";

export function useReport(type: ReportType, query: ReportQuery) {
  return useQuery({
    queryKey: ["reports", type, query],
    queryFn: () => getReport(type, query),
    placeholderData: (prev) => prev,
  });
}

export function useDownloadReport() {
  return useMutation({
    mutationFn: ({
      type,
      query,
      format,
    }: {
      type: ReportType;
      query: ReportQuery;
      format: Exclude<ReportFormat, "json">;
    }) => downloadReport(type, query, format),
  });
}
