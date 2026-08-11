import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  listCustomers,
  getCustomer,
  createCustomer,
  updateCustomer,
  deleteCustomer,
  listCustomerNotes,
  addCustomerNote,
} from "./api/customers.api";
import type { CustomerFormValues } from "./schema";
import type { ListCustomersParams } from "./types";

export function useCustomers(params: ListCustomersParams) {
  return useQuery({
    queryKey: ["customers", "list", params],
    queryFn: () => listCustomers(params),
    placeholderData: (prev) => prev, // keep old page visible while the next page loads
  });
}

export function useCustomer(id: string | null) {
  return useQuery({
    queryKey: ["customers", "detail", id],
    queryFn: () => getCustomer(id!),
    enabled: !!id,
  });
}

export function useCreateCustomer() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (input: CustomerFormValues) => createCustomer(input),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["customers", "list"] }),
  });
}

export function useUpdateCustomer(id: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (input: Partial<CustomerFormValues>) => updateCustomer(id, input),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["customers", "list"] });
      qc.invalidateQueries({ queryKey: ["customers", "detail", id] });
    },
  });
}

export function useDeleteCustomer() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => deleteCustomer(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["customers", "list"] }),
  });
}

export function useCustomerNotes(id: string | null) {
  return useQuery({
    queryKey: ["customers", "notes", id],
    queryFn: () => listCustomerNotes(id!),
    enabled: !!id,
  });
}

export function useAddCustomerNote(id: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (body: string) => addCustomerNote(id, body),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["customers", "notes", id] }),
  });
}
