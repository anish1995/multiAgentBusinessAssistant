"use client";

import { useEffect, useState } from "react";

import { ApiUnavailableBanner } from "@/components/ApiUnavailableBanner";
import { EmptyState } from "@/components/EmptyState";
import { PageHeader } from "@/components/PageHeader";
import { TicketDetailModal } from "@/components/TicketDetailModal";
import { Badge, statusVariant } from "@/components/ui/Badge";
import { Card } from "@/components/ui/Card";
import { getTickets, SupportTicket } from "@/lib/api";

export default function TicketsPage() {
  const [ticketsResult, setTicketsResult] = useState<Awaited<ReturnType<typeof getTickets>> | null>(null);
  const [selectedTicket, setSelectedTicket] = useState<SupportTicket | null>(null);

  useEffect(() => {
    getTickets().then(setTicketsResult);
  }, []);

  if (!ticketsResult) {
    return <div className="text-sm text-slate-500">Loading tickets...</div>;
  }

  return (
    <div className="space-y-8">
      <PageHeader
        eyebrow="Support"
        title="Support Tickets"
        description="Monitor customer issues and resolution progress. Managed by the Support Agent."
      />

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
