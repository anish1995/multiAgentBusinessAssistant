import { AgentConsole } from "@/components/AgentConsole";
import { PageHeader } from "@/components/PageHeader";
import { Card } from "@/components/ui/Card";

const agentRoster = [
  { name: "Manager", desc: "Routes tasks and coordinates agents" },
  { name: "Sales", desc: "Leads and pipeline actions" },
  { name: "Support", desc: "Ticket triage and responses" },
  { name: "Finance", desc: "Invoices and reminders" },
  { name: "Knowledge", desc: "Policy and document answers" },
];

export default function AgentsPage() {
  return (
    <div className="space-y-8">
      <PageHeader
        eyebrow="AI Orchestration"
        title="Agent Console"
        description="Describe a business goal in natural language. The Manager Agent will delegate work across Sales, Support, Finance, and Knowledge agents."
      />

      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-5">
        {agentRoster.map((agent) => (
          <div
            key={agent.name}
            className="rounded-2xl border border-slate-200 bg-white/80 px-4 py-3 shadow-sm"
          >
            <p className="text-sm font-semibold text-slate-900">{agent.name}</p>
            <p className="mt-1 text-xs text-slate-500">{agent.desc}</p>
          </div>
        ))}
      </div>

      <Card>
        <AgentConsole />
      </Card>
    </div>
  );
}
