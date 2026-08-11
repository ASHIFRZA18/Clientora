import { useQuery } from "@tanstack/react-query";
import { apiClient } from "@/lib/api-client";
import type { DashboardOverview } from "./types";

async function fetchOverview(): Promise<DashboardOverview> {
  const { data } = await apiClient.get<{ data: DashboardOverview }>("/dashboard/overview");
  return data.data;
}

export function useDashboardOverview() {
  return useQuery({
    queryKey: ["dashboard", "overview"],
    queryFn: fetchOverview,
    staleTime: 60_000,
  });
}
