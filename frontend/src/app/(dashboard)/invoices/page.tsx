import { ApiUnavailableBanner } from "@/components/ApiUnavailableBanner";
import { SendRemindersButton } from "@/components/SendRemindersButton";
import { EmptyState } from "@/components/EmptyState";
import { PageHeader } from "@/components/PageHeader";
import { Badge, statusVariant } from "@/components/ui/Badge";
import { Card } from "@/components/ui/Card";
import { getInvoices } from "@/lib/api";

export default async function InvoicesPage() {
  const invoicesResult = await getInvoices();

  return (
    <div className="space-y-8">
      <PageHeader
        eyebrow="Finance"
        title="Invoices"
        description="Track billing status and overdue accounts. Managed by the Finance Agent."
        action={<SendRemindersButton />}
      />

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
