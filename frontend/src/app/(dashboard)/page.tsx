import Link from "next/link";

import { ApiUnavailableBanner } from "@/components/ApiUnavailableBanner";
import { IconAgents, IconArrowRight, IconInvoices, IconLeads, IconTickets } from "@/components/icons";
import { PageHeader } from "@/components/PageHeader";
import { StatCard } from "@/components/StatCard";
import { Card } from "@/components/ui/Card";
import { getDashboardStats } from "@/lib/api";

const agents = [
  {
    name: "Sales Agent",
    role: "Lead qualification & outreach",
    color: "from-sky-500 to-cyan-500",
  },
  {
    name: "Support Agent",
    role: "Ticket triage & resolution",
    color: "from-violet-500 to-purple-500",
  },
  {
    name: "Finance Agent",
    role: "Invoices & payment follow-ups",
    color: "from-amber-500 to-orange-500",
  },
  {
    name: "Knowledge Agent",
    role: "Document Q&A and policy lookup",
    color: "from-emerald-500 to-teal-500",
  },
];

export default async function DashboardPage() {
  const statsResult = await getDashboardStats();

  return (
    <div className="space-y-8">
      <PageHeader
        eyebrow="Overview"
        title="Good afternoon, Admin"
        description="Monitor business operations and orchestrate multi-agent workflows from a single command center."
        action={
          <Link
            href="/agents"
            className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-indigo-600 to-violet-600 px-4 py-2.5 text-sm font-medium text-white shadow-lg shadow-indigo-500/25 transition hover:from-indigo-500 hover:to-violet-500"
          >
            <IconAgents className="h-4 w-4" />
            Launch Agent Console
          </Link>
        }
      />

      {!statsResult.ok ? (
        <ApiUnavailableBanner message={statsResult.error} />
      ) : (
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          <StatCard
            label="Total Leads"
            value={statsResult.data.totalLeads}
            hint="Qualified leads ready for outreach"
            accent="sky"
            icon={<IconLeads className="h-5 w-5" />}
          />
          <StatCard
            label="Open Tickets"
            value={statsResult.data.openTickets}
            hint="Support queue needs attention"
            accent="indigo"
            icon={<IconTickets className="h-5 w-5" />}
          />
          <StatCard
            label="Overdue Invoices"
            value={statsResult.data.overdueInvoices}
            hint="Finance agent can draft reminders"
            accent="amber"
            icon={<IconInvoices className="h-5 w-5" />}
          />
          <StatCard
            label="Pending Tasks"
            value={statsResult.data.pendingTasks}
            hint="Follow-ups awaiting action"
            accent="emerald"
            icon={<IconAgents className="h-5 w-5" />}
          />
        </div>
      )}

      <div className="grid gap-6 xl:grid-cols-[1.4fr_1fr]">
        <Card className="relative overflow-hidden">
          <div className="absolute -right-8 -top-8 h-32 w-32 rounded-full bg-indigo-100/60 blur-2xl" />
          <div className="relative">
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-indigo-600">
              Featured workflow
            </p>
            <h3 className="mt-2 text-xl font-semibold text-slate-900">
              Automate collections in one request
            </h3>
            <p className="mt-2 max-w-xl text-sm leading-relaxed text-slate-500">
              Ask the Manager Agent to find overdue invoices, draft reminder emails,
              and create follow-up tasks — all coordinated across specialized agents.
            </p>
            <div className="mt-5 rounded-2xl border border-slate-200 bg-slate-50/80 p-4">
              <p className="text-sm italic text-slate-600">
                &quot;Find overdue invoices, draft reminder emails, and create follow-up tasks.&quot;
              </p>
            </div>
            <Link
              href="/agents"
              className="mt-5 inline-flex items-center gap-2 text-sm font-medium text-indigo-600 transition hover:text-indigo-500"
            >
              Try this workflow
              <IconArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </Card>

        <Card>
          <p className="text-sm font-semibold text-slate-900">System status</p>
          <div className="mt-4 space-y-3">
            {[
              { label: "Frontend", status: "Operational", ok: true },
              { label: "Spring Boot API", status: statsResult.ok ? "Connected" : "Offline", ok: statsResult.ok },
              { label: "AI Orchestrator", status: "Ready when started", ok: true },
            ].map((item) => (
              <div
                key={item.label}
                className="flex items-center justify-between rounded-xl border border-slate-100 bg-slate-50/70 px-4 py-3"
              >
                <span className="text-sm text-slate-600">{item.label}</span>
                <span className="flex items-center gap-2 text-sm font-medium text-slate-700">
                  <span
                    className={`h-2 w-2 rounded-full ${
                      item.ok ? "bg-emerald-500" : "bg-amber-500 animate-pulse-soft"
                    }`}
                  />
                  {item.status}
                </span>
              </div>
            ))}
          </div>
        </Card>
      </div>

      <div>
        <div className="mb-4 flex items-end justify-between">
          <div>
            <h3 className="text-lg font-semibold text-slate-900">Your AI agents</h3>
            <p className="mt-1 text-sm text-slate-500">
              Specialized agents coordinated by the Manager.
            </p>
          </div>
        </div>
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          {agents.map((agent) => (
            <Card key={agent.name} hover>
              <div className={`inline-flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br ${agent.color} text-white shadow-lg`}>
                <IconAgents className="h-5 w-5" />
              </div>
              <h4 className="mt-4 font-semibold text-slate-900">{agent.name}</h4>
              <p className="mt-1 text-sm text-slate-500">{agent.role}</p>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
}
