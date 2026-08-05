"use client";

import { useEffect, useState } from "react";

import { AdminOnlyAction } from "@/components/AdminOnlyAction";
import { ApiUnavailableBanner } from "@/components/ApiUnavailableBanner";
import { EmptyState } from "@/components/EmptyState";
import { PageHeader } from "@/components/PageHeader";
import { TicketDetailModal } from "@/components/TicketDetailModal";
import { Badge, statusVariant } from "@/components/ui/Badge";
import { Card } from "@/components/ui/Card";
import { createTicket, getTickets, SupportTicket } from "@/lib/api";

export default function TicketsPage() {
  const [ticketsResult, setTicketsResult] = useState<Awaited<ReturnType<typeof getTickets>> | null>(null);
  const [selectedTicket, setSelectedTicket] = useState<SupportTicket | null>(null);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [formState, setFormState] = useState({
    subject: "",
    description: "",
    customerEmail: "",
    priority: "MEDIUM",
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function loadTickets() {
    const result = await getTickets();
    setTicketsResult(result);
  }

  useEffect(() => {
    loadTickets();
  }, []);

  async function submitTicket(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setIsSubmitting(true);
    try {
      await createTicket(formState);
      setFormState({ subject: "", description: "", customerEmail: "", priority: "MEDIUM" });
      setIsFormOpen(false);
      await loadTickets();
    } finally {
      setIsSubmitting(false);
    }
  }

  if (!ticketsResult) {
    return <div className="text-sm text-slate-500">Loading tickets...</div>;
  }

  return (
    <div className="space-y-8">
      <PageHeader
        eyebrow="Support"
        title="Support Tickets"
        description="Monitor customer issues and resolution progress. Managed by the Support Agent."
        action={
          <AdminOnlyAction>
            <button
              type="button"
              onClick={() => setIsFormOpen((open) => !open)}
              className="rounded-xl bg-indigo-600 px-4 py-2 text-sm font-medium text-white shadow-md shadow-indigo-500/20 transition hover:bg-indigo-500"
            >
              {isFormOpen ? "Close form" : "New ticket"}
            </button>
          </AdminOnlyAction>
        }
      />

      <AdminOnlyAction>
        {isFormOpen ? (
          <Card>
            <form onSubmit={submitTicket} className="grid gap-4 md:grid-cols-2">
              <div className="md:col-span-2">
                <label className="mb-1 block text-sm font-medium text-slate-700">Subject</label>
                <input
                  value={formState.subject}
                  onChange={(event) => setFormState({ ...formState, subject: event.target.value })}
                  required
                  className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm text-slate-700 outline-none ring-0 transition focus:border-indigo-300 focus:ring-4 focus:ring-indigo-100"
                />
              </div>
              <div className="md:col-span-2">
                <label className="mb-1 block text-sm font-medium text-slate-700">Description</label>
                <textarea
                  value={formState.description}
                  onChange={(event) => setFormState({ ...formState, description: event.target.value })}
                  required
                  rows={4}
                  className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm text-slate-700 outline-none transition focus:border-indigo-300 focus:ring-4 focus:ring-indigo-100"
                />
              </div>
              <div>
                <label className="mb-1 block text-sm font-medium text-slate-700">Customer email</label>
                <input
                  type="email"
                  value={formState.customerEmail}
                  onChange={(event) => setFormState({ ...formState, customerEmail: event.target.value })}
                  required
                  className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm text-slate-700 outline-none transition focus:border-indigo-300 focus:ring-4 focus:ring-indigo-100"
                />
              </div>
              <div>
                <label className="mb-1 block text-sm font-medium text-slate-700">Priority</label>
                <select
                  value={formState.priority}
                  onChange={(event) => setFormState({ ...formState, priority: event.target.value })}
                  className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm text-slate-700 outline-none transition focus:border-indigo-300 focus:ring-4 focus:ring-indigo-100"
                >
                  <option value="LOW">Low</option>
                  <option value="MEDIUM">Medium</option>
                  <option value="HIGH">High</option>
                </select>
              </div>
              <div className="md:col-span-2 flex justify-end">
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="rounded-xl bg-slate-900 px-4 py-2 text-sm font-medium text-white transition hover:bg-slate-700 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {isSubmitting ? "Creating..." : "Create ticket"}
                </button>
              </div>
            </form>
          </Card>
        ) : null}
      </AdminOnlyAction>

      {!ticketsResult.ok ? (
        <ApiUnavailableBanner message={ticketsResult.error} />
      ) : ticketsResult.data.length === 0 ? (
        <EmptyState
          title="No open tickets"
          description="Support tickets will show up here when customers report issues."
        />
      ) : (
        <div className="grid gap-4">
          {ticketsResult.data.map((ticket) => (
            <Card key={ticket.id} hover>
              <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                <div className="min-w-0">
                  <div className="flex flex-wrap items-center gap-2">
                    <h3 className="text-base font-semibold text-slate-900">
                      {ticket.subject}
                    </h3>
                    <Badge variant={statusVariant(ticket.status)}>{ticket.status}</Badge>
                    <Badge variant={statusVariant(ticket.priority)}>
                      {ticket.priority}
                    </Badge>
                  </div>
                  <p className="mt-3 text-sm leading-relaxed text-slate-600">
                    {ticket.description}
                  </p>
                  <p className="mt-4 text-xs text-slate-400">{ticket.customerEmail}</p>
                </div>
                <button
                  type="button"
                  onClick={() => setSelectedTicket(ticket)}
                  className="shrink-0 rounded-xl border border-slate-200 px-3 py-2 text-sm font-medium text-slate-600 transition hover:border-indigo-200 hover:text-indigo-700"
                >
                  View details
                </button>
              </div>
            </Card>
          ))}
        </div>
      )}

      <TicketDetailModal ticket={selectedTicket} onClose={() => setSelectedTicket(null)} />
    </div>
  );
}
