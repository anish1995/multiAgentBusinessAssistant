"use client";

import { usePathname } from "next/navigation";

import { Sidebar } from "@/components/Sidebar";
import { TopBar } from "@/components/TopBar";

const titles: Record<string, string> = {
  "/": "Dashboard",
  "/leads": "Leads",
  "/tickets": "Support Tickets",
  "/invoices": "Invoices",
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
    <div className="app-shell flex min-h-screen text-slate-900">
      <Sidebar />
      <div className="flex min-w-0 flex-1 flex-col">
        <TopBar title={title} />
        <main className="flex-1 overflow-y-auto px-8 py-8">{children}</main>
      </div>
    </div>
  );
}
