import { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { Plus, Search, Target } from "lucide-react";
import { AppShell } from "@/components/layout/AppShell";
import { Button } from "@/components/ui/Button";
import { Select } from "@/components/ui/Select";
import { DataTable, type Column } from "@/components/ui/DataTable";
import { Pagination } from "@/components/ui/Pagination";
import { ConfirmDialog } from "@/components/ui/ConfirmDialog";
import { useDebouncedValue } from "@/lib/use-debounced-value";
import { useLeads, useDeleteLead } from "@/features/leads/hooks";
import { LeadFormDrawer } from "@/features/leads/components/LeadFormDrawer";
import { LeadDetailDrawer } from "@/features/leads/components/LeadDetailDrawer";
import { LeadStatusBadge } from "@/features/leads/components/LeadStatusBadge";
import { ScoreBar } from "@/features/leads/components/ScoreBar";
import type { Lead, LeadStatus, ListLeadsParams } from "@/features/leads/types";

export default function Leads() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [search, setSearch] = useState("");
  const debouncedSearch = useDebouncedValue(search, 300);
  const [status, setStatus] = useState<LeadStatus | "">("");
  const [page, setPage] = useState(1);
  const [sortBy, setSortBy] = useState<ListLeadsParams["sortBy"]>("createdAt");
  const [sortDir, setSortDir] = useState<"asc" | "desc">("desc");

  const [formOpen, setFormOpen] = useState(false);
  const [detailId, setDetailId] = useState<string | null>(null);
  const [pendingDeleteId, setPendingDeleteId] = useState<string | null>(null);

  const { data, isLoading } = useLeads({
    page,
    pageSize: 20,
    search: debouncedSearch || undefined,
    status: status || undefined,
    sortBy,
    sortDir,
  });
  const deleteLead = useDeleteLead();

  useEffect(() => {
    if (searchParams.get("new") === "1") {
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
      setSortBy(key as ListLeadsParams["sortBy"]);
      setSortDir("desc");
    }
    setPage(1);
  };

  const confirmDelete = () => {
    if (!pendingDeleteId) return;
    deleteLead.mutate(pendingDeleteId, {
      onSuccess: () => {
        setPendingDeleteId(null);
        setDetailId(null);
      },
    });
  };

  const columns: Column<Lead>[] = [
    {
      key: "customer",
      header: "Customer",
      render: (l) => (
        <div>
          <p className="font-medium text-ink">{l.customer.name}</p>
          {l.customer.company && <p className="text-xs text-muted mt-0.5">{l.customer.company}</p>}
        </div>
      ),
    },
    {
      key: "source",
      header: "Source",
      render: (l) => <span className="text-xs text-muted">{l.source ?? "—"}</span>,
    },
    {
      key: "score",
      header: "Score",
      sortable: true,
      render: (l) => <ScoreBar score={l.score} />,
    },
    {
      key: "status",
      header: "Status",
      sortable: true,
      render: (l) => <LeadStatusBadge status={l.status} />,
    },
    {
      key: "assignee",
      header: "Assigned to",
      render: (l) => (
        <span className="text-xs text-ink">{l.assignee?.name ?? <span className="text-muted">Unassigned</span>}</span>
      ),
    },
    {
      key: "createdAt",
      header: "Created",
      sortable: true,
      render: (l) => <span className="text-xs text-muted">{new Date(l.createdAt).toLocaleDateString()}</span>,
    },
  ];

  return (
    <AppShell title="Leads">
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
                placeholder="Search leads…"
                className="w-full h-9 rounded-md border border-line bg-surface pl-8 pr-3 text-sm focus:outline-none focus:border-primary focus:shadow-focus transition-shadow"
              />
            </div>
            <Select
              value={status}
              onChange={(e) => {
                setStatus(e.target.value as LeadStatus | "");
                setPage(1);
              }}
            >
              <option value="">All statuses</option>
              <option value="NEW">New</option>
              <option value="CONTACTED">Contacted</option>
              <option value="QUALIFIED">Qualified</option>
              <option value="DISQUALIFIED">Disqualified</option>
            </Select>
          </div>
          <Button size="sm" onClick={() => setFormOpen(true)}>
            <Plus className="h-3.5 w-3.5" />
            New lead
          </Button>
        </div>

        <div className="rounded-lg border border-line bg-surface overflow-hidden">
          {data?.data.length === 0 && !isLoading && !debouncedSearch && !status ? (
            <div className="flex flex-col items-center justify-center py-16 text-center px-4">
              <div className="h-12 w-12 rounded-full bg-primary-50 flex items-center justify-center mb-3">
                <Target className="h-5 w-5 text-primary" />
              </div>
              <p className="text-sm font-medium text-ink">No leads yet</p>
              <p className="text-xs text-muted mt-1 max-w-xs">
                Capture a lead against a customer to start tracking it through your pipeline.
              </p>
              <Button size="sm" className="mt-4" onClick={() => setFormOpen(true)}>
                <Plus className="h-3.5 w-3.5" />
                New lead
              </Button>
            </div>
          ) : (
            <>
              <DataTable
                columns={columns}
                data={data?.data ?? []}
                isLoading={isLoading}
                emptyMessage="No leads match your filters."
                sortBy={sortBy}
                sortDir={sortDir}
                onSortChange={handleSort}
                onRowClick={(l) => setDetailId(l.id)}
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

      <LeadFormDrawer open={formOpen} onClose={() => setFormOpen(false)} />

      <LeadDetailDrawer
        leadId={detailId}
        onClose={() => setDetailId(null)}
        onDelete={() => setPendingDeleteId(detailId)}
      />

      <ConfirmDialog
        open={!!pendingDeleteId}
        title="Delete this lead?"
        description="This removes it from the active list. Any linked deals stay on record."
        confirmLabel="Delete"
        isLoading={deleteLead.isPending}
        onConfirm={confirmDelete}
        onCancel={() => setPendingDeleteId(null)}
      />
    </AppShell>
  );
}
