"use client";

import { useEffect, useState } from "react";

import { ApiUnavailableBanner } from "@/components/ApiUnavailableBanner";
import { EmptyState } from "@/components/EmptyState";
import { PageHeader } from "@/components/PageHeader";
import { Badge, statusVariant } from "@/components/ui/Badge";
import { Card } from "@/components/ui/Card";
import { getTasks, Task, updateTask } from "@/lib/api";

export default function TasksPage() {
  const [tasksResult, setTasksResult] = useState<Awaited<ReturnType<typeof getTasks>> | null>(null);

  useEffect(() => {
    getTasks().then(setTasksResult);
  }, []);

  async function markComplete(task: Task) {
    await updateTask(task.id, { ...task, status: "COMPLETED" });
    const refreshed = await getTasks();
    setTasksResult(refreshed);
  }

  if (!tasksResult) {
    return <div className="text-sm text-slate-500">Loading tasks...</div>;
  }

  return (
    <div className="space-y-8">
      <PageHeader
        eyebrow="Operations"
        title="Tasks"
        description="Follow-up work created by agents and finance workflows."
      />

      {!tasksResult.ok ? (
        <ApiUnavailableBanner message={tasksResult.error} />
      ) : tasksResult.data.length === 0 ? (
        <EmptyState
          title="No tasks yet"
          description="Run an agent workflow with follow-up tasks to populate this queue."
        />
      ) : (
        <div className="grid gap-4">
          {tasksResult.data.map((task) => (
            <Card key={task.id} hover>
              <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                <div>
                  <div className="flex flex-wrap items-center gap-2">
                    <h3 className="text-base font-semibold text-slate-900">{task.title}</h3>
                    <Badge variant={statusVariant(task.status)}>{task.status}</Badge>
                    <Badge variant="default">{task.assignedAgent}</Badge>
                  </div>
                  {task.description ? (
                    <p className="mt-3 text-sm leading-relaxed text-slate-600">
                      {task.description}
                    </p>
                  ) : null}
                </div>
                {task.status === "PENDING" ? (
                  <button
                    type="button"
                    onClick={() => markComplete(task)}
                    className="shrink-0 rounded-xl border border-slate-200 px-3 py-2 text-sm font-medium text-slate-600 transition hover:border-emerald-200 hover:text-emerald-700"
                  >
                    Mark complete
                  </button>
                ) : null}
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
