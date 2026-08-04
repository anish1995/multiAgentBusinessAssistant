"use client";

import { SupportTicket } from "@/lib/api";
import { Badge, statusVariant } from "@/components/ui/Badge";

type TicketDetailModalProps = {
  ticket: SupportTicket | null;
  onClose: () => void;
};

export function TicketDetailModal({ ticket, onClose }: TicketDetailModalProps) {
  if (!ticket) {
    return null;
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 p-4 backdrop-blur-sm">
      <div className="w-full max-w-lg rounded-2xl border border-slate-200 bg-white p-6 shadow-2xl">
        <div className="flex items-start justify-between gap-4">
          <div>
            <h3 className="text-lg font-semibold text-slate-900">{ticket.subject}</h3>
            <p className="mt-1 text-sm text-slate-500">{ticket.customerEmail}</p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg px-2 py-1 text-sm text-slate-500 hover:bg-slate-100"
          >
            Close
          </button>
        </div>

        <div className="mt-4 flex flex-wrap gap-2">
          <Badge variant={statusVariant(ticket.status)}>{ticket.status}</Badge>
          <Badge variant={statusVariant(ticket.priority)}>{ticket.priority}</Badge>
        </div>

        <p className="mt-5 text-sm leading-relaxed text-slate-600">{ticket.description}</p>
      </div>
    </div>
  );
}
