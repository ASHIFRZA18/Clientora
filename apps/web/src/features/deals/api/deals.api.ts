import { apiClient } from "@/lib/api-client";
import type { Board, Deal, DealDetail, DealStage } from "../types";
import type { DealFormValues } from "../schema";

export async function getBoard(): Promise<Board> {
  const { data } = await apiClient.get<{ data: Board }>("/deals/board");
  return data.data;
}

export async function getDeal(id: string): Promise<DealDetail> {
  const { data } = await apiClient.get<{ data: DealDetail }>(`/deals/${id}`);
  return data.data;
}

export async function createDeal(input: DealFormValues): Promise<Deal> {
  const { data } = await apiClient.post<{ data: Deal }>("/deals", input);
  return data.data;
}

export async function updateDeal(id: string, input: Partial<DealFormValues>): Promise<Deal> {
  const { data } = await apiClient.patch<{ data: Deal }>(`/deals/${id}`, input);
  return data.data;
}

export async function moveDeal(id: string, toStage: DealStage, toIndex: number): Promise<Deal> {
  const { data } = await apiClient.patch<{ data: Deal }>(`/deals/${id}/move`, { toStage, toIndex });
  return data.data;
}

export async function deleteDeal(id: string): Promise<void> {
  await apiClient.delete(`/deals/${id}`);
}
