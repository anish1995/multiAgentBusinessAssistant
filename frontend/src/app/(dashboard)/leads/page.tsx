"use client";

import { useEffect, useState } from "react";

import { AdminOnlyAction } from "@/components/AdminOnlyAction";
import { ApiUnavailableBanner } from "@/components/ApiUnavailableBanner";
import { EmptyState } from "@/components/EmptyState";
import { ExportLeadsButton } from "@/components/ExportLeadsButton";
import { PageHeader } from "@/components/PageHeader";
import { Badge, statusVariant } from "@/components/ui/Badge";
import { Card } from "@/components/ui/Card";
import { createLead, getLeads } from "@/lib/api";

type LeadsPageProps = {
  searchParams: Promise<{ search?: string }>;
};

export default function LeadsPage({ searchParams }: LeadsPageProps) {
  const [params, setParams] = useState<{ search?: string }>({});
  const [leadsResult, setLeadsResult] = useState<Awaited<ReturnType<typeof getLeads>> | null>(null);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [formState, setFormState] = useState({
    name: "",
    email: "",
    company: "",
    notes: "",
    status: "NEW",
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    async function load() {
      const resolved = await searchParams;
      setParams(resolved);
      const result = await getLeads(resolved.search);
      setLeadsResult(result);
    }
    load();
  }, [searchParams]);

  async function submitLead(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setIsSubmitting(true);
    try {
      await createLead(formState);
      setFormState({ name: "", email: "", company: "", notes: "", status: "NEW" });
      setIsFormOpen(false);
      const refreshed = await getLeads(params.search);
      setLeadsResult(refreshed);
    } finally {
      setIsSubmitting(false);
    }
  }

  if (!leadsResult) {
    return <div className="text-sm text-slate-500">Loading leads...</div>;
  }

  return (
    <div className="space-y-8">
      <PageHeader
        eyebrow="Sales"
        title="Leads"
        description="Track prospects and qualification status. Managed by the Sales Agent."
        action={
          <div className="flex items-center gap-3">
            <AdminOnlyAction>
              <button
                type="button"
                onClick={() => setIsFormOpen((open) => !open)}
                className="rounded-xl bg-indigo-600 px-4 py-2 text-sm font-medium text-white shadow-md shadow-indigo-500/20 transition hover:bg-indigo-500"
              >
                {isFormOpen ? "Close form" : "New lead"}
              </button>
            </AdminOnlyAction>
            {leadsResult.ok && leadsResult.data.length > 0 ? (
              <ExportLeadsButton leads={leadsResult.data} />
            ) : null}
          </div>
        }
      />

      <AdminOnlyAction>
        {isFormOpen ? (
          <Card>
            <form onSubmit={submitLead} className="grid gap-4 md:grid-cols-2">
              <div>
                <label className="mb-1 block text-sm font-medium text-slate-700">Name</label>
                <input
                  value={formState.name}
                  onChange={(event) => setFormState({ ...formState, name: event.target.value })}
                  required
                  className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm text-slate-700 outline-none transition focus:border-indigo-300 focus:ring-4 focus:ring-indigo-100"
                />
              </div>
              <div>
                <label className="mb-1 block text-sm font-medium text-slate-700">Email</label>
                <input
                  type="email"
                  value={formState.email}
                  onChange={(event) => setFormState({ ...formState, email: event.target.value })}
                  required
                  className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm text-slate-700 outline-none transition focus:border-indigo-300 focus:ring-4 focus:ring-indigo-100"
                />
              </div>
              <div>
                <label className="mb-1 block text-sm font-medium text-slate-700">Company</label>
                <input
                  value={formState.company}
                  onChange={(event) => setFormState({ ...formState, company: event.target.value })}
                  className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm text-slate-700 outline-none transition focus:border-indigo-300 focus:ring-4 focus:ring-indigo-100"
                />
              </div>
              <div>
                <label className="mb-1 block text-sm font-medium text-slate-700">Status</label>
                <select
                  value={formState.status}
                  onChange={(event) => setFormState({ ...formState, status: event.target.value })}
                  className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm text-slate-700 outline-none transition focus:border-indigo-300 focus:ring-4 focus:ring-indigo-100"
                >
                  <option value="NEW">New</option>
                  <option value="CONTACTED">Contacted</option>
                  <option value="QUALIFIED">Qualified</option>
                  <option value="NEGOTIATION">Negotiation</option>
                  <option value="CLOSED">Closed</option>
                </select>
              </div>
              <div className="md:col-span-2">
                <label className="mb-1 block text-sm font-medium text-slate-700">Notes</label>
                <textarea
                  value={formState.notes}
                  onChange={(event) => setFormState({ ...formState, notes: event.target.value })}
                  rows={4}
                  className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm text-slate-700 outline-none transition focus:border-indigo-300 focus:ring-4 focus:ring-indigo-100"
                />
              </div>
              <div className="md:col-span-2 flex justify-end">
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="rounded-xl bg-slate-900 px-4 py-2 text-sm font-medium text-white transition hover:bg-slate-700 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {isSubmitting ? "Creating..." : "Create lead"}
                </button>
              </div>
            </form>
          </Card>
        ) : null}
      </AdminOnlyAction>

      {!leadsResult.ok ? (
        <ApiUnavailableBanner message={leadsResult.error} />
      ) : leadsResult.data.length === 0 ? (
        <EmptyState
          title="No leads yet"
          description="When leads are added to the system, they will appear here for the Sales Agent to qualify."
        />
      ) : (
        <Card className="overflow-hidden p-0">
          <div className="overflow-x-auto">
            <table className="min-w-full text-left text-sm">
              <thead className="bg-slate-50/90 text-xs uppercase tracking-wide text-slate-500">
                <tr>
                  <th className="px-6 py-4 font-semibold">Name</th>
                  <th className="px-6 py-4 font-semibold">Company</th>
                  <th className="px-6 py-4 font-semibold">Email</th>
                  <th className="px-6 py-4 font-semibold">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {leadsResult.data.map((lead) => (
                  <tr key={lead.id} className="transition hover:bg-slate-50/80">
                    <td className="px-6 py-4 font-medium text-slate-900">{lead.name}</td>
                    <td className="px-6 py-4 text-slate-600">{lead.company}</td>
                    <td className="px-6 py-4 text-slate-600">{lead.email}</td>
                    <td className="px-6 py-4">
                      <Badge variant={statusVariant(lead.status)}>{lead.status}</Badge>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      )}
    </div>
  );
}
