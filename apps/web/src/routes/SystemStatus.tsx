import { useQuery } from "@tanstack/react-query";
import { motion } from "framer-motion";
import { CheckCircle2, XCircle, Loader2, Database, Server, Globe } from "lucide-react";
import { apiClient } from "@/lib/api-client";
import { Card, CardHeader, CardBody } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";

interface HealthResponse {
  status: "ok";
  service: string;
  timestamp: string;
  database: "connected" | "disconnected";
  uptime: number;
}

async function fetchHealth(): Promise<HealthResponse> {
  const { data } = await apiClient.get("/health");
  return data;
}

const checks = [
  { key: "api", label: "API Server", icon: Server },
  { key: "database", label: "PostgreSQL", icon: Database },
  { key: "web", label: "Web Client", icon: Globe },
] as const;

export default function SystemStatus() {
  const { data, isLoading, isError, error } = useQuery({
    queryKey: ["health"],
    queryFn: fetchHealth,
    refetchInterval: 15_000,
  });

  return (
    <div className="min-h-screen bg-canvas flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
        className="w-full max-w-md"
      >
        <div className="mb-3 flex items-center gap-2">
          <div className="h-8 w-8 rounded-md bg-primary flex items-center justify-center">
            <span className="text-white font-bold text-sm">M</span>
          </div>
          <div>
            <p className="font-semibold text-ink leading-none">Meridian CRM</p>
            <p className="text-xs text-muted mt-0.5">Phase 1 · System diagnostics</p>
          </div>
        </div>

        <Card>
          <CardHeader className="flex items-center justify-between">
            <span className="text-sm font-medium text-ink">Platform Health</span>
            {isLoading ? (
              <Badge tone="neutral">Checking…</Badge>
            ) : isError ? (
              <Badge tone="danger">Degraded</Badge>
            ) : (
              <Badge tone="success">All systems go</Badge>
            )}
          </CardHeader>
          <CardBody className="space-y-2.5">
            {checks.map(({ key, label, icon: Icon }, i) => {
              const ok = key === "web" ? true : !isError && !isLoading && data;
              const dbOk = key === "database" ? data?.database === "connected" : true;
              const isGood = ok && dbOk;
              return (
                <motion.div
                  key={key}
                  initial={{ opacity: 0, x: -4 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.06 }}
                  className="flex items-center justify-between rounded-md border border-line px-2.5 py-2"
                >
                  <div className="flex items-center gap-2">
                    <Icon className="h-4 w-4 text-muted" strokeWidth={1.75} />
                    <span className="text-sm text-ink">{label}</span>
                  </div>
                  {isLoading && key !== "web" ? (
                    <Loader2 className="h-4 w-4 text-muted animate-spin" />
                  ) : isGood ? (
                    <CheckCircle2 className="h-4 w-4 text-success" />
                  ) : (
                    <XCircle className="h-4 w-4 text-danger" />
                  )}
                </motion.div>
              );
            })}
          </CardBody>
        </Card>

        {isError && (
          <p className="mt-2.5 text-xs text-danger">
            Could not reach API — {(error as Error)?.message ?? "unknown error"}. Is{" "}
            <code className="text-[11px] bg-slate-100 px-1 py-0.5 rounded">npm run dev</code>{" "}
            running on port 4000?
          </p>
        )}
        {data && (
          <p className="mt-2.5 text-xs text-muted text-center">
            Uptime {Math.floor(data.uptime)}s · Last checked{" "}
            {new Date(data.timestamp).toLocaleTimeString()}
          </p>
        )}
      </motion.div>
    </div>
  );
}
