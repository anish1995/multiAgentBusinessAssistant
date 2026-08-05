"use client";

import { useEffect, useState } from "react";

import { AdminOnlyAction } from "@/components/AdminOnlyAction";
import { ApiUnavailableBanner } from "@/components/ApiUnavailableBanner";
import { EmptyState } from "@/components/EmptyState";
import { PageHeader } from "@/components/PageHeader";
import { Badge, statusVariant } from "@/components/ui/Badge";
import { Card } from "@/components/ui/Card";
import { createTask, getTasks, Task, updateTask } from "@/lib/api";

export default function TasksPage() {
  const [tasksResult, setTasksResult] = useState<Awaited<ReturnType<typeof getTasks>> | null>(null);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [formState, setFormState] = useState({
    title: "",
    description: "",
    assignedAgent: "support",
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function loadTasks() {
    const result = await getTasks();
    setTasksResult(result);
  }

  useEffect(() => {
    loadTasks();
  }, []);

  async function markComplete(task: Task) {
    await updateTask(task.id, { ...task, status: "COMPLETED" });
    const refreshed = await getTasks();
    setTasksResult(refreshed);
  }

  async function submitTask(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setIsSubmitting(true);
    try {
      await createTask({ ...formState, status: "PENDING" });
      setFormState({ title: "", description: "", assignedAgent: "support" });
      setIsFormOpen(false);
      await loadTasks();
    } finally {
      setIsSubmitting(false);
    }
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
        action={
          <AdminOnlyAction>
            <button
              type="button"
              onClick={() => setIsFormOpen((open) => !open)}
              className="rounded-xl bg-indigo-600 px-4 py-2 text-sm font-medium text-white shadow-md shadow-indigo-500/20 transition hover:bg-indigo-500"
            >
              {isFormOpen ? "Close form" : "New task"}
            </button>
          </AdminOnlyAction>
        }
      />

      <AdminOnlyAction>
        {isFormOpen ? (
          <Card>
            <form onSubmit={submitTask} className="grid gap-4 md:grid-cols-2">
              <div className="md:col-span-2">
                <label className="mb-1 block text-sm font-medium text-slate-700">Title</label>
                <input
                  value={formState.title}
                  onChange={(event) => setFormState({ ...formState, title: event.target.value })}
                  required
                  className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm text-slate-700 outline-none transition focus:border-indigo-300 focus:ring-4 focus:ring-indigo-100"
                />
              </div>
              <div className="md:col-span-2">
                <label className="mb-1 block text-sm font-medium text-slate-700">Description</label>
                <textarea
                  value={formState.description}
                  onChange={(event) => setFormState({ ...formState, description: event.target.value })}
                  rows={4}
                  className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm text-slate-700 outline-none transition focus:border-indigo-300 focus:ring-4 focus:ring-indigo-100"
                />
              </div>
              <div>
                <label className="mb-1 block text-sm font-medium text-slate-700">Assigned agent</label>
                <select
                  value={formState.assignedAgent}
                  onChange={(event) => setFormState({ ...formState, assignedAgent: event.target.value })}
                  className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm text-slate-700 outline-none transition focus:border-indigo-300 focus:ring-4 focus:ring-indigo-100"
                >
                  <option value="support">Support</option>
                  <option value="sales">Sales</option>
                  <option value="finance">Finance</option>
                  <option value="manager">Manager</option>
                </select>
              </div>
              <div className="md:col-span-2 flex justify-end">
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="rounded-xl bg-slate-900 px-4 py-2 text-sm font-medium text-white transition hover:bg-slate-700 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {isSubmitting ? "Creating..." : "Create task"}
                </button>
              </div>
            </form>
          </Card>
        ) : null}
      </AdminOnlyAction>

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
