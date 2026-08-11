import { CheckCircle2, Circle, Flag } from "lucide-react";
import { Card, CardHeader, CardBody } from "@/components/ui/Card";
import type { DashboardOverview } from "../types";

export function TasksToday({ tasks }: { tasks: DashboardOverview["tasksToday"] }) {
  return (
    <Card>
      <CardHeader>
        <span className="text-sm font-medium text-ink">Today's tasks</span>
      </CardHeader>
      <CardBody className="space-y-1">
        {tasks.length === 0 ? (
          <p className="text-sm text-muted">Nothing due today. You're clear.</p>
        ) : (
          tasks.map((task) => (
            <div key={task.id} className="flex items-center gap-2.5 py-1.5">
              {task.status === "DONE" ? (
                <CheckCircle2 className="h-4 w-4 text-success shrink-0" />
              ) : (
                <Circle className="h-4 w-4 text-muted shrink-0" strokeWidth={1.75} />
              )}
              <span className="text-sm text-ink flex-1 truncate">{task.title}</span>
              {task.priority === "high" && <Flag className="h-3.5 w-3.5 text-danger shrink-0" />}
              {task.dueDate && (
                <span className="text-xs text-muted shrink-0">
                  {new Date(task.dueDate).toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit" })}
                </span>
              )}
            </div>
          ))
        )}
      </CardBody>
    </Card>
  );
}
