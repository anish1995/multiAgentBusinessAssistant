"use client";

import { FormEvent, useState } from "react";

import { IconAgents, IconSparkles } from "@/components/icons";
import { AgentWorkflowResponse, runAgentWorkflow } from "@/lib/api";

const exampleQuery =
  "Find overdue invoices, draft reminder emails, and create follow-up tasks.";

const suggestions = [
  "Find overdue invoices and draft reminder emails",
  "Triage open support tickets by priority",
  "Review qualified leads for outreach this week",
  "What is our invoice escalation policy?",
];

export function AgentConsole() {
  const [query, setQuery] = useState(exampleQuery);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<AgentWorkflowResponse | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const response = await runAgentWorkflow(query);
      setResult(response);
    } catch (submitError) {
      setError(
        submitError instanceof Error
          ? submitError.message
          : "Failed to run workflow",
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="space-y-6">
      <div className="grid gap-4 lg:grid-cols-[1fr_280px]">
        <form onSubmit={handleSubmit} className="space-y-4">
          <label className="block">
            <span className="text-sm font-medium text-slate-700">Business request</span>
            <div className="relative mt-2">
              <textarea
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                rows={5}
                placeholder="Describe what you want the agents to accomplish..."
                className="w-full resize-none rounded-2xl border border-slate-200 bg-slate-50/80 px-4 py-3.5 text-sm text-slate-800 outline-none transition placeholder:text-slate-400 focus:border-indigo-300 focus:bg-white focus:ring-4 focus:ring-indigo-100"
              />
              <div className="pointer-events-none absolute bottom-3 right-3 flex items-center gap-1 rounded-full bg-white/90 px-2 py-1 text-[11px] text-slate-400 ring-1 ring-slate-200">
                <IconSparkles className="h-3.5 w-3.5" />
                Manager Agent
              </div>
            </div>
          </label>

          <div className="flex flex-wrap items-center gap-3">
            <button
              type="submit"
              disabled={loading}
              className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-indigo-600 to-violet-600 px-5 py-2.5 text-sm font-medium text-white shadow-lg shadow-indigo-500/25 transition hover:from-indigo-500 hover:to-violet-500 disabled:cursor-not-allowed disabled:opacity-60"
            >
              <IconAgents className="h-4 w-4" />
              {loading ? "Orchestrating agents..." : "Run workflow"}
            </button>
            <button
              type="button"
              onClick={() => setQuery(exampleQuery)}
              className="rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-medium text-slate-600 transition hover:border-slate-300 hover:text-slate-800"
            >
              Reset example
            </button>
          </div>
        </form>

        <div className="rounded-2xl border border-slate-200 bg-slate-50/70 p-4">
          <p className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-500">
            Quick prompts
          </p>
          <div className="mt-3 space-y-2">
            {suggestions.map((suggestion) => (
              <button
                key={suggestion}
                type="button"
                onClick={() => setQuery(suggestion)}
                className="w-full rounded-xl border border-transparent bg-white px-3 py-2.5 text-left text-sm text-slate-600 transition hover:border-indigo-200 hover:text-indigo-700"
              >
                {suggestion}
              </button>
            ))}
          </div>
        </div>
      </div>

      {error ? (
        <div className="rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">
          {error}
        </div>
      ) : null}

      {loading ? (
        <div className="space-y-3 rounded-2xl border border-slate-200 bg-white p-5">
          <div className="h-4 w-40 shimmer rounded-lg" />
          <div className="h-3 w-full shimmer rounded-lg" />
          <div className="h-3 w-5/6 shimmer rounded-lg" />
        </div>
      ) : null}

      {result ? (
        <div className="space-y-4">
          <div className="rounded-2xl border border-indigo-200/70 bg-gradient-to-r from-indigo-50 to-violet-50 p-5">
            <p className="text-xs font-semibold uppercase tracking-[0.16em] text-indigo-600">
              Summary
            </p>
            <p className="mt-2 text-sm leading-relaxed text-slate-800">{result.summary}</p>
          </div>

          <div className="grid gap-4 lg:grid-cols-2">
            <div className="rounded-2xl border border-slate-200 bg-white p-5">
              <p className="text-sm font-semibold text-slate-900">Workflow steps</p>
              <ol className="mt-4 space-y-3">
                {result.steps.map((step, index) => (
                  <li key={step} className="flex gap-3 text-sm text-slate-600">
                    <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-indigo-100 text-xs font-semibold text-indigo-700">
                      {index + 1}
                    </span>
                    <span className="pt-0.5">{step}</span>
                  </li>
                ))}
              </ol>
            </div>

            <div className="rounded-2xl border border-slate-200 bg-slate-950 p-5">
              <p className="text-sm font-semibold text-slate-200">Agent output</p>
              <pre className="mt-4 max-h-80 overflow-auto text-xs leading-relaxed text-emerald-300">
                {JSON.stringify(result.results, null, 2)}
              </pre>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}
