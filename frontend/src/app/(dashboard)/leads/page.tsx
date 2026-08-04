import { ApiUnavailableBanner } from "@/components/ApiUnavailableBanner";
import { ExportLeadsButton } from "@/components/ExportLeadsButton";
import { EmptyState } from "@/components/EmptyState";
import { PageHeader } from "@/components/PageHeader";
import { Badge, statusVariant } from "@/components/ui/Badge";
import { Card } from "@/components/ui/Card";
import { getLeads } from "@/lib/api";

type LeadsPageProps = {
  searchParams: Promise<{ search?: string }>;
};

export default async function LeadsPage({ searchParams }: LeadsPageProps) {
  const params = await searchParams;
  const leadsResult = await getLeads(params.search);

  return (
    <div className="space-y-8">
      <PageHeader
        eyebrow="Sales"
        title="Leads"
        description="Track prospects and qualification status. Managed by the Sales Agent."
        action={
          leadsResult.ok && leadsResult.data.length > 0 ? (
            <ExportLeadsButton leads={leadsResult.data} />
          ) : null
        }
      />

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
