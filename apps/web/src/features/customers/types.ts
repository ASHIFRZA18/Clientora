export type CustomerStatus = "active" | "inactive";

export interface Customer {
  id: string;
  name: string;
  company: string | null;
  email: string | null;
  phone: string | null;
  status: CustomerStatus;
  ownerId: string;
  owner: { id: string; name: string };
  createdAt: string;
  updatedAt: string;
  _count: { leads: number; deals: number };
}

export interface CustomerDetail extends Customer {
  leads: { id: string; source: string | null; status: string; score: number; createdAt: string }[];
  deals: { id: string; title: string; stage: string; value: string; currency: string; createdAt: string }[];
}

export interface CustomerNote {
  id: string;
  body: string;
  createdAt: string;
  author: { name: string };
}

export interface Paginated<T> {
  data: T[];
  meta: { page: number; pageSize: number; total: number; totalPages: number };
}

export interface ListCustomersParams {
  page: number;
  pageSize: number;
  search?: string;
  status?: CustomerStatus;
  sortBy: "name" | "company" | "createdAt" | "updatedAt";
  sortDir: "asc" | "desc";
}
