import { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { Building2, Plus, Search, UserPlus } from "lucide-react";
import { AppShell } from "@/components/layout/AppShell";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { Select } from "@/components/ui/Select";
import { DataTable, type Column } from "@/components/ui/DataTable";
import { Pagination } from "@/components/ui/Pagination";
import { ConfirmDialog } from "@/components/ui/ConfirmDialog";
import { useDebouncedValue } from "@/lib/use-debounced-value";
import { useCustomers, useDeleteCustomer } from "@/features/customers/hooks";
import { CustomerFormDrawer } from "@/features/customers/components/CustomerFormDrawer";
import { CustomerDetailDrawer } from "@/features/customers/components/CustomerDetailDrawer";
import type { Customer, CustomerStatus, ListCustomersParams } from "@/features/customers/types";

export default function Customers() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [search, setSearch] = useState("");
  const debouncedSearch = useDebouncedValue(search, 300);
  const [status, setStatus] = useState<CustomerStatus | "">("");
  const [page, setPage] = useState(1);
  const [sortBy, setSortBy] = useState<ListCustomersParams["sortBy"]>("createdAt");
  const [sortDir, setSortDir] = useState<"asc" | "desc">("desc");

  const [formOpen, setFormOpen] = useState(false);
  const [editingCustomer, setEditingCustomer] = useState<Customer | null>(null);
  const [detailId, setDetailId] = useState<string | null>(null);
  const [pendingDeleteId, setPendingDeleteId] = useState<string | null>(null);

  const { data, isLoading } = useCustomers({
    page,
    pageSize: 20,
    search: debouncedSearch || undefined,
    status: status || undefined,
    sortBy,
    sortDir,
  });
  const deleteCustomer = useDeleteCustomer();

  useEffect(() => {
    if (searchParams.get("new") === "1") {
      setEditingCustomer(null);
      setFormOpen(true);
      setSearchParams((prev) => {
        prev.delete("new");
        return prev;
      });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchParams]);

  const handleSort = (key: string) => {
    if (key === sortBy) {
      setSortDir((d) => (d === "asc" ? "desc" : "asc"));
    } else {
      setSortBy(key as ListCustomersParams["sortBy"]);
      setSortDir("asc");
    }
    setPage(1);
  };

  const openCreate = () => {
    setEditingCustomer(null);
    setFormOpen(true);
  };

  const openEdit = (customer: Customer) => {
    setEditingCustomer(customer);
    setDetailId(null);
    setFormOpen(true);
  };

  const confirmDelete = () => {
    if (!pendingDeleteId) return;
    deleteCustomer.mutate(pendingDeleteId, {
      onSuccess: () => {
        setPendingDeleteId(null);
        setDetailId(null);
      },
    });
  };

  const columns: Column<Customer>[] = [
    {
      key: "name",
      header: "Name",
      sortable: true,
      render: (c) => (
        <div>
          <p className="font-medium text-ink">{c.name}</p>
          {c.company && (
            <p className="text-xs text-muted flex items-center gap-1 mt-0.5">
              <Building2 className="h-3 w-3" /> {c.company}
            </p>
          )}
        </div>
      ),
    },
    {
      key: "contact",
      header: "Contact",
      render: (c) => (
        <div className="text-xs text-muted space-y-0.5">
          {c.email && <p>{c.email}</p>}
          {c.phone && <p>{c.phone}</p>}
        </div>
      ),
    },
    {
      key: "status",
      header: "Status",
      render: (c) => <Badge tone={c.status === "active" ? "success" : "neutral"}>{c.status}</Badge>,
    },
    {
      key: "activity",
      header: "Activity",
      render: (c) => (
        <span className="text-xs text-muted">
          {c._count.leads} lead{c._count.leads !== 1 && "s"} · {c._count.deals} deal
          {c._count.deals !== 1 && "s"}
        </span>
      ),
    },
    {
      key: "owner",
      header: "Owner",
      render: (c) => <span className="text-xs text-ink">{c.owner.name}</span>,
    },
    {
      key: "updatedAt",
      header: "Updated",
      sortable: true,
      render: (c) => (
        <span className="text-xs text-muted">{new Date(c.updatedAt).toLocaleDateString()}</span>
      ),
    },
  ];

  return (
    <AppShell title="Customers">
      <div className="space-y-3">
        <div className="flex flex-col sm:flex-row gap-2 sm:items-center sm:justify-between">
          <div className="flex flex-1 gap-2">
            <div className="relative flex-1 max-w-xs">
              <Search className="h-3.5 w-3.5 text-muted absolute left-2.5 top-1/2 -translate-y-1/2" />
              <input
                value={search}
                onChange={(e) => {
                  setSearch(e.target.value);
                  setPage(1);
                }}
                placeholder="Search customers…"
                className="w-full h-9 rounded-md border border-line bg-surface pl-8 pr-3 text-sm focus:outline-none focus:border-primary focus:shadow-focus transition-shadow"
              />
            </div>
            <Select
              value={status}
              onChange={(e) => {
                setStatus(e.target.value as CustomerStatus | "");
                setPage(1);
              }}
            >
              <option value="">All statuses</option>
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
            </Select>
          </div>
          <Button size="sm" onClick={openCreate}>
            <Plus className="h-3.5 w-3.5" />
            New customer
          </Button>
        </div>

        <div className="rounded-lg border border-line bg-surface overflow-hidden">
          {data?.data.length === 0 && !isLoading && !debouncedSearch && !status ? (
            <div className="flex flex-col items-center justify-center py-16 text-center px-4">
              <div className="h-12 w-12 rounded-full bg-primary-50 flex items-center justify-center mb-3">
                <UserPlus className="h-5 w-5 text-primary" />
              </div>
              <p className="text-sm font-medium text-ink">No customers yet</p>
              <p className="text-xs text-muted mt-1 max-w-xs">
                Add your first customer to start tracking leads and deals against their account.
              </p>
              <Button size="sm" className="mt-4" onClick={openCreate}>
                <Plus className="h-3.5 w-3.5" />
                New customer
              </Button>
            </div>
          ) : (
            <>
              <DataTable
                columns={columns}
                data={data?.data ?? []}
                isLoading={isLoading}
                emptyMessage="No customers match your filters."
                sortBy={sortBy}
                sortDir={sortDir}
                onSortChange={handleSort}
                onRowClick={(c) => setDetailId(c.id)}
              />
              <Pagination
                page={data?.meta.page ?? 1}
                totalPages={data?.meta.totalPages ?? 1}
                total={data?.meta.total ?? 0}
                pageSize={data?.meta.pageSize ?? 20}
                onPageChange={setPage}
              />
            </>
          )}
        </div>
      </div>

      <CustomerFormDrawer open={formOpen} onClose={() => setFormOpen(false)} customer={editingCustomer} />

      <CustomerDetailDrawer
        customerId={detailId}
        onClose={() => setDetailId(null)}
        onEdit={() => {
          const customer = data?.data.find((c) => c.id === detailId);
          if (customer) openEdit(customer);
        }}
        onDelete={() => setPendingDeleteId(detailId)}
      />

      <ConfirmDialog
        open={!!pendingDeleteId}
        title="Delete this customer?"
        description="This removes them from your active list. Related leads and deals stay on record."
        confirmLabel="Delete"
        isLoading={deleteCustomer.isPending}
        onConfirm={confirmDelete}
        onCancel={() => setPendingDeleteId(null)}
      />
    </AppShell>
  );
}
