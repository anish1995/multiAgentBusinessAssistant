"use client";

import { useState } from "react";

import { sendInvoiceReminders } from "@/lib/api";

export function SendRemindersButton() {
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  async function handleClick() {
    setLoading(true);
    setMessage(null);
    try {
      const result = await sendInvoiceReminders();
      setMessage(result.summary);
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Failed to send reminders");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="flex items-center gap-3">
      {message ? <span className="text-sm text-slate-500">{message}</span> : null}
      <button
        type="button"
        onClick={handleClick}
        disabled={loading}
        className="rounded-xl bg-gradient-to-r from-indigo-600 to-violet-600 px-4 py-2.5 text-sm font-medium text-white shadow-lg shadow-indigo-500/20 disabled:opacity-60"
      >
        {loading ? "Running..." : "Send reminders"}
      </button>
    </div>
  );
}
