"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";

import {
  IconAgents,
  IconDashboard,
  IconInvoices,
  IconLeads,
  IconSparkles,
  IconTickets,
} from "@/components/icons";
import { logout as apiLogout } from "@/lib/api";
import { type AuthUser, getUser } from "@/lib/auth";

const links = [
  { href: "/", label: "Dashboard", icon: IconDashboard },
  { href: "/leads", label: "Leads", icon: IconLeads },
  { href: "/tickets", label: "Support", icon: IconTickets },
  { href: "/invoices", label: "Invoices", icon: IconInvoices },
  { href: "/tasks", label: "Tasks", icon: IconSparkles },
  { href: "/agents", label: "Agent Console", icon: IconAgents },
];

export function Sidebar() {
  const pathname = usePathname();
  const [user, setUser] = useState<AuthUser | null>(null);

  useEffect(() => {
    setUser(getUser());
  }, []);

  const initials = user?.fullName
    ? user.fullName
        .split(" ")
        .map((part) => part[0])
        .join("")
        .slice(0, 2)
        .toUpperCase()
    : "BA";

  return (
    <aside className="sidebar-gradient flex h-screen w-[272px] shrink-0 flex-col border-r border-white/5 text-slate-200">
      <div className="border-b border-white/5 px-5 py-6">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-indigo-500 to-violet-600 shadow-lg shadow-indigo-500/30">
            <IconSparkles className="h-5 w-5 text-white" />
          </div>
          <div>
            <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-slate-400">
              Nexus AI
            </p>
            <h1 className="text-base font-semibold text-white">Business Assistant</h1>
          </div>
        </div>
      </div>

      <nav className="flex flex-1 flex-col gap-1 p-4">
        <p className="mb-2 px-3 text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-500">
          Workspace
        </p>
        {links.map((link) => {
          const isActive =
            link.href === "/"
              ? pathname === "/"
              : pathname.startsWith(link.href);
          const Icon = link.icon;

          return (
            <Link
              key={link.href}
              href={link.href}
              className={`group flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition ${
                isActive
                  ? "bg-white/10 text-white shadow-inner shadow-white/5 ring-1 ring-white/10"
                  : "text-slate-400 hover:bg-white/5 hover:text-white"
              }`}
            >
              <Icon
                className={`h-5 w-5 ${
                  isActive ? "text-indigo-300" : "text-slate-500 group-hover:text-slate-300"
                }`}
              />
              {link.label}
              {isActive ? (
                <span className="ml-auto h-1.5 w-1.5 rounded-full bg-indigo-400" />
              ) : null}
            </Link>
          );
        })}
      </nav>

      <div className="border-t border-white/5 p-4">
        <div className="rounded-2xl bg-gradient-to-br from-indigo-500/15 to-violet-500/10 p-4 ring-1 ring-white/10">
          <p className="text-xs font-medium text-indigo-200">AI Orchestration</p>
          <p className="mt-1 text-xs leading-relaxed text-slate-400">
            5 agents coordinated by the Manager for end-to-end workflows.
          </p>
        </div>
        <div className="mt-4 flex items-center gap-3 px-1">
          <div className="flex h-9 w-9 items-center justify-center rounded-full bg-gradient-to-br from-slate-700 to-slate-800 text-xs font-semibold text-white">
            {initials}
          </div>
          <div className="min-w-0 flex-1">
            <p className="truncate text-sm font-medium text-white">
              {user?.fullName ?? "Business Admin"}
            </p>
            <p className="truncate text-xs text-slate-500">
              {user?.email ?? "admin@company.com"}
            </p>
          </div>
          <button
            type="button"
            onClick={() => apiLogout()}
            className="rounded-lg px-2 py-1 text-xs font-medium text-slate-400 transition hover:bg-white/10 hover:text-white"
          >
            Logout
          </button>
        </div>
      </div>
    </aside>
  );
}
