"use client";

import { useEffect, useState } from "react";

import { AdminOnlyAction } from "@/components/AdminOnlyAction";
import { ApiUnavailableBanner } from "@/components/ApiUnavailableBanner";
import { EmptyState } from "@/components/EmptyState";
import { PageHeader } from "@/components/PageHeader";
import { SendRemindersButton } from "@/components/SendRemindersButton";
import { Badge, statusVariant } from "@/components/ui/Badge";
import { Card } from "@/components/ui/Card";
import { createInvoice, getInvoices } from "@/lib/api";

export default function InvoicesPage() {
  const [invoicesResult, setInvoicesResult] = useState<Awaited<ReturnType<typeof getInvoices>> | null>(null);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [formState, setFormState] = useState({
    invoiceNumber: "",
    customerName: "",
    customerEmail: "",
    amount: "",
    dueDate: "",
    status: "SENT",
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function loadInvoices() {
    const result = await getInvoices();
    setInvoicesResult(result);
  }

  useEffect(() => {
    loadInvoices();
  }, []);

  async function submitInvoice(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setIsSubmitting(true);
    try {
      await createInvoice({
        ...formState,
        amount: Number(formState.amount),
      });
      setFormState({
        invoiceNumber: "",
        customerName: "",
        customerEmail: "",
        amount: "",
        dueDate: "",
        status: "SENT",
      });
      setIsFormOpen(false);
      await loadInvoices();
    } finally {
      setIsSubmitting(false);
    }
  }

  if (!invoicesResult) {
    return <div className="text-sm text-slate-500">Loading invoices...</div>;
  }

  return (
    <div className="space-y-8">
      <PageHeader
        eyebrow="Finance"
        title="Invoices"
        description="Track billing status and overdue accounts. Managed by the Finance Agent."
        action={
          <div className="flex items-center gap-3">
            <AdminOnlyAction>
              <button
                type="button"
                onClick={() => setIsFormOpen((open) => !open)}
                className="rounded-xl bg-indigo-600 px-4 py-2 text-sm font-medium text-white shadow-md shadow-indigo-500/20 transition hover:bg-indigo-500"
              >
                {isFormOpen ? "Close form" : "New invoice"}
              </button>
            </AdminOnlyAction>
            <SendRemindersButton />
          </div>
        }
      />

      <AdminOnlyAction>
        {isFormOpen ? (
          <Card>
            <form onSubmit={submitInvoice} className="grid gap-4 md:grid-cols-2">
              <div>
                <label className="mb-1 block text-sm font-medium text-slate-700">Invoice number</label>
                <input
                  value={formState.invoiceNumber}
                  onChange={(event) => setFormState({ ...formState, invoiceNumber: event.target.value })}
                  required
                  className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm text-slate-700 outline-none transition focus:border-indigo-300 focus:ring-4 focus:ring-indigo-100"
                />
              </div>
              <div>
                <label className="mb-1 block text-sm font-medium text-slate-700">Customer name</label>
                <input
                  value={formState.customerName}
                  onChange={(event) => setFormState({ ...formState, customerName: event.target.value })}
                  required
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
                <label className="mb-1 block text-sm font-medium text-slate-700">Amount</label>
                <input
                  type="number"
                  min="0"
                  step="0.01"
                  value={formState.amount}
                  onChange={(event) => setFormState({ ...formState, amount: event.target.value })}
                  required
                  className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm text-slate-700 outline-none transition focus:border-indigo-300 focus:ring-4 focus:ring-indigo-100"
                />
              </div>
              <div>
                <label className="mb-1 block text-sm font-medium text-slate-700">Due date</label>
                <input
                  type="date"
                  value={formState.dueDate}
                  onChange={(event) => setFormState({ ...formState, dueDate: event.target.value })}
                  required
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
                  <option value="SENT">Sent</option>
                  <option value="PAID">Paid</option>
                  <option value="OVERDUE">Overdue</option>
                </select>
              </div>
              <div className="md:col-span-2 flex justify-end">
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="rounded-xl bg-slate-900 px-4 py-2 text-sm font-medium text-white transition hover:bg-slate-700 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {isSubmitting ? "Creating..." : "Create invoice"}
                </button>
              </div>
            </form>
          </Card>
        ) : null}
      </AdminOnlyAction>

      {!invoicesResult.ok ? (
        <ApiUnavailableBanner message={invoicesResult.error} />
      ) : invoicesResult.data.length === 0 ? (
        <EmptyState
          title="No invoices found"
          description="Invoices will appear here once billing records are available."
        />
      ) : (
        <Card className="overflow-hidden p-0">
          <div className="overflow-x-auto">
            <table className="min-w-full text-left text-sm">
              <thead className="bg-slate-50/90 text-xs uppercase tracking-wide text-slate-500">
                <tr>
                  <th className="px-6 py-4 font-semibold">Invoice</th>
                  <th className="px-6 py-4 font-semibold">Customer</th>
                  <th className="px-6 py-4 font-semibold">Amount</th>
                  <th className="px-6 py-4 font-semibold">Due Date</th>
                  <th className="px-6 py-4 font-semibold">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {invoicesResult.data.map((invoice) => (
                  <tr key={invoice.id} className="transition hover:bg-slate-50/80">
                    <td className="px-6 py-4 font-medium text-slate-900">
                      {invoice.invoiceNumber}
                    </td>
                    <td className="px-6 py-4">
                      <p className="font-medium text-slate-800">{invoice.customerName}</p>
                      <p className="text-xs text-slate-400">{invoice.customerEmail}</p>
                    </td>
                    <td className="px-6 py-4 font-medium text-slate-800">
                      ${invoice.amount.toLocaleString()}
                    </td>
                    <td className="px-6 py-4 text-slate-600">{invoice.dueDate}</td>
                    <td className="px-6 py-4">
                      <Badge variant={statusVariant(invoice.status)}>
                        {invoice.status}
                      </Badge>
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
