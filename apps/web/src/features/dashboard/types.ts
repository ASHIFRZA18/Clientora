export interface StatMetric {
  value: number;
  changePct: number | null;
}

export interface DashboardOverview {
  stats: {
    revenue: StatMetric;
    customers: StatMetric;
    leads: StatMetric;
    dealsWon: StatMetric;
  };
  revenueTrend: { month: string; revenue: number }[];
  customerGrowth: { month: string; total: number }[];
  funnel: { stage: string; count: number }[];
  recentDeals: {
    id: string;
    title: string;
    customerName: string;
    value: number;
    currency: string;
    stage: string;
    updatedAt: string;
  }[];
  tasksToday: {
    id: string;
    title: string;
    dueDate: string | null;
    priority: string;
    status: string;
  }[];
  activity: {
    id: string;
    type: string;
    actorName: string;
    relatedType: string;
    relatedId: string;
    createdAt: string;
  }[];
}
