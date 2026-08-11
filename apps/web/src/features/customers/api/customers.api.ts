import { apiClient } from "@/lib/api-client";
import type {
  Customer,
  CustomerDetail,
  CustomerNote,
  ListCustomersParams,
  Paginated,
} from "../types";
import type { CustomerFormValues } from "../schema";

export async function listCustomers(params: ListCustomersParams): Promise<Paginated<Customer>> {
  const { data } = await apiClient.get<{ data: Customer[]; meta: Paginated<Customer>["meta"] }>(
    "/customers",
    { params }
  );
  return { data: data.data, meta: data.meta };
}

export async function getCustomer(id: string): Promise<CustomerDetail> {
  const { data } = await apiClient.get<{ data: CustomerDetail }>(`/customers/${id}`);
  return data.data;
}

export async function createCustomer(input: CustomerFormValues): Promise<Customer> {
  const { data } = await apiClient.post<{ data: Customer }>("/customers", input);
  return data.data;
}

export async function updateCustomer(id: string, input: Partial<CustomerFormValues>): Promise<Customer> {
  const { data } = await apiClient.patch<{ data: Customer }>(`/customers/${id}`, input);
  return data.data;
}

export async function deleteCustomer(id: string): Promise<void> {
  await apiClient.delete(`/customers/${id}`);
}

export async function listCustomerNotes(id: string): Promise<CustomerNote[]> {
  const { data } = await apiClient.get<{ data: CustomerNote[] }>(`/customers/${id}/notes`);
  return data.data;
}

export async function addCustomerNote(id: string, body: string): Promise<CustomerNote> {
  const { data } = await apiClient.post<{ data: CustomerNote }>(`/customers/${id}/notes`, { body });
  return data.data;
}
