"use client";

import { usePathname } from "next/navigation";

import { AuthGuard } from "@/components/AuthGuard";
import { Sidebar } from "@/components/Sidebar";
import { TopBar } from "@/components/TopBar";

const titles: Record<string, string> = {
  "/": "Dashboard",
  "/leads": "Leads",
  "/tickets": "Support Tickets",
  "/invoices": "Invoices",
  "/tasks": "Tasks",
  "/agents": "Agent Console",
};

export default function DashboardLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const pathname = usePathname();
  const title = titles[pathname] ?? "Dashboard";

  return (
    <AuthGuard>
      <div className="app-shell flex h-screen overflow-hidden text-slate-900">
        <Sidebar />
        <div className="flex min-h-0 min-w-0 flex-1 flex-col overflow-hidden">
          <TopBar title={title} />
          <main className="min-h-0 flex-1 overflow-y-auto px-8 py-8">{children}</main>
        </div>
      </div>
    </AuthGuard>
  );
}
