import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  listLeads,
  getLead,
  createLead,
  updateLead,
  deleteLead,
  assignLead,
  recalculateLeadScore,
<<<<<<< HEAD
  getAiLeadInsight,
=======
>>>>>>> fb8fa837090b401d0df8bd8364282176ff710672
} from "./api/leads.api";
import type { LeadFormValues } from "./schema";
import type { ListLeadsParams } from "./types";

export function useLeads(params: ListLeadsParams) {
  return useQuery({
    queryKey: ["leads", "list", params],
    queryFn: () => listLeads(params),
    placeholderData: (prev) => prev,
  });
}

export function useLead(id: string | null) {
  return useQuery({
    queryKey: ["leads", "detail", id],
    queryFn: () => getLead(id!),
    enabled: !!id,
  });
}

export function useCreateLead() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (input: LeadFormValues) => createLead(input),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["leads", "list"] }),
  });
}

export function useUpdateLead(id: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (input: Partial<LeadFormValues>) => updateLead(id, input),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["leads", "list"] });
      qc.invalidateQueries({ queryKey: ["leads", "detail", id] });
    },
  });
}

export function useDeleteLead() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => deleteLead(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["leads", "list"] }),
  });
}

export function useAssignLead(id: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (assignedTo: string | null) => assignLead(id, assignedTo),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["leads", "list"] });
      qc.invalidateQueries({ queryKey: ["leads", "detail", id] });
    },
  });
}

export function useRecalculateLeadScore(id: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: () => recalculateLeadScore(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["leads", "list"] });
      qc.invalidateQueries({ queryKey: ["leads", "detail", id] });
    },
  });
}
<<<<<<< HEAD

export function useAiLeadInsight(id: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: () => getAiLeadInsight(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["leads", "list"] });
      qc.invalidateQueries({ queryKey: ["leads", "detail", id] });
    },
  });
}
=======
>>>>>>> fb8fa837090b401d0df8bd8364282176ff710672
