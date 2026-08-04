"use client";

import { useEffect, useState } from "react";

import { getAiHealth, getHealth } from "@/lib/api";

type SystemStatusProps = {
  apiConnected: boolean;
};

export function SystemStatus({ apiConnected }: SystemStatusProps) {
  const [dbStatus, setDbStatus] = useState("Checking...");
  const [aiStatus, setAiStatus] = useState("Checking...");
  const [dbOk, setDbOk] = useState(false);
  const [aiOk, setAiOk] = useState(false);

  useEffect(() => {
    getHealth().then((result) => {
      if (result.ok) {
        const db = result.data.components.database === "UP";
        const ai = result.data.components.aiServices === "UP";
        setDbOk(db);
        setDbStatus(db ? "Connected" : "Offline");
        setAiOk(ai);
        setAiStatus(ai ? "Connected" : "Offline");
      } else {
        setDbStatus("Offline");
        setAiStatus("Offline");
      }
    });

    getAiHealth().then((result) => {
      if (result.ok) {
        setAiOk(true);
        setAiStatus(result.llmEnabled ? "Connected (LLM enabled)" : "Connected");
      }
    });
  }, []);

  const items = [
    { label: "Frontend", status: "Operational", ok: true },
    { label: "Spring Boot API", status: apiConnected ? "Connected" : "Offline", ok: apiConnected },
    { label: "PostgreSQL", status: dbStatus, ok: dbOk },
    { label: "AI Orchestrator", status: aiStatus, ok: aiOk },
  ];

  return (
    <div className="mt-4 space-y-3">
      {items.map((item) => (
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
  );
}
