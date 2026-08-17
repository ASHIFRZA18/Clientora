import { apiClient } from "@/lib/api-client";
import type { Lead, LeadDetail, ListLeadsParams, Paginated } from "../types";
import type { LeadFormValues } from "../schema";

export async function listLeads(params: ListLeadsParams): Promise<Paginated<Lead>> {
  const { data } = await apiClient.get<{ data: Lead[]; meta: Paginated<Lead>["meta"] }>("/leads", {
    params,
  });
  return { data: data.data, meta: data.meta };
}

export async function getLead(id: string): Promise<LeadDetail> {
  const { data } = await apiClient.get<{ data: LeadDetail }>(`/leads/${id}`);
  return data.data;
}

export async function createLead(input: LeadFormValues): Promise<Lead> {
  const { data } = await apiClient.post<{ data: Lead }>("/leads", input);
  return data.data;
}

export async function updateLead(id: string, input: Partial<LeadFormValues>): Promise<Lead> {
  const { data } = await apiClient.patch<{ data: Lead }>(`/leads/${id}`, input);
  return data.data;
}

export async function deleteLead(id: string): Promise<void> {
  await apiClient.delete(`/leads/${id}`);
}

export async function assignLead(id: string, assignedTo: string | null): Promise<Lead> {
  const { data } = await apiClient.patch<{ data: Lead }>(`/leads/${id}/assign`, { assignedTo });
  return data.data;
}

export async function recalculateLeadScore(id: string): Promise<Lead> {
  const { data } = await apiClient.post<{ data: Lead }>(`/leads/${id}/score/recalculate`);
  return data.data;
}

export async function getAiLeadInsight(id: string): Promise<LeadDetail> {
  const { data } = await apiClient.post<{ data: LeadDetail }>(`/leads/${id}/score/ai`);
  return data.data;
}
