"use client";

import { Lead } from "@/lib/api";
import { exportToCsv } from "@/lib/export";

export function ExportLeadsButton({ leads }: { leads: Lead[] }) {
  return (
    <button
      type="button"
      onClick={() =>
        exportToCsv(
          "leads.csv",
          ["Name", "Company", "Email", "Status"],
          leads.map((lead) => [lead.name, lead.company, lead.email, lead.status]),
        )
      }
      className="rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-medium text-slate-700 shadow-sm transition hover:border-slate-300"
    >
      Export leads
    </button>
  );
}
