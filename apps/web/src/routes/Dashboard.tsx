import { AlertCircle, DollarSign, Handshake, Target, Users } from "lucide-react";
import { AppShell } from "@/components/layout/AppShell";
import { StatCard } from "@/components/ui/StatCard";
import { useDashboardOverview } from "@/features/dashboard/hooks";
import { RevenueChart } from "@/features/dashboard/components/RevenueChart";
import { CustomerGrowthChart } from "@/features/dashboard/components/CustomerGrowthChart";
import { FunnelChart } from "@/features/dashboard/components/FunnelChart";
import { RecentDeals } from "@/features/dashboard/components/RecentDeals";
import { TasksToday } from "@/features/dashboard/components/TasksToday";
import { ActivityTimeline } from "@/features/dashboard/components/ActivityTimeline";
import { QuickActions } from "@/features/dashboard/components/QuickActions";
import { CRMHero3D } from "@/features/dashboard/components/CRMHero3D";

function DashboardSkeleton() {
  return (
    <div className="space-y-4 animate-pulse">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="h-28 rounded-lg bg-slate-100" />
        ))}
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <div className="lg:col-span-2 h-72 rounded-lg bg-slate-100" />
        <div className="h-72 rounded-lg bg-slate-100" />
      </div>
    </div>
  );
}

export default function Dashboard() {
  const { data, isLoading, isError } = useDashboardOverview();

  return (
    <AppShell title="Dashboard">
      <CRMHero3D />

      {isLoading && <DashboardSkeleton />}

      {isError && (
        <div className="flex items-center gap-2 rounded-md bg-danger/10 px-3 py-2.5 text-sm text-danger">
          <AlertCircle className="h-4 w-4 shrink-0" />
          Couldn't load your dashboard data. Try refreshing.
        </div>
      )}

      {data && (
        <div className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
            <StatCard
              label="Revenue"
              value={data.stats.revenue.value}
              changePct={data.stats.revenue.changePct}
              icon={DollarSign}
              format="currency"
              delay={0}
            />
            <StatCard
              label="Customers"
              value={data.stats.customers.value}
              changePct={data.stats.customers.changePct}
              icon={Users}
              delay={0.05}
            />
            <StatCard
              label="New leads"
              value={data.stats.leads.value}
              changePct={data.stats.leads.changePct}
              icon={Target}
              delay={0.1}
            />
            <StatCard
              label="Deals won"
              value={data.stats.dealsWon.value}
              changePct={data.stats.dealsWon.changePct}
              icon={Handshake}
              delay={0.15}
            />
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
            <div className="lg:col-span-2 space-y-4">
              <RevenueChart data={data.revenueTrend} />
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FunnelChart data={data.funnel} />
                <CustomerGrowthChart data={data.customerGrowth} />
              </div>
              <RecentDeals deals={data.recentDeals} />
            </div>

            <div className="space-y-4">
              <QuickActions />
              <TasksToday tasks={data.tasksToday} />
              <ActivityTimeline items={data.activity} />
            </div>
          </div>
        </div>
      )}
    </AppShell>
  );
}