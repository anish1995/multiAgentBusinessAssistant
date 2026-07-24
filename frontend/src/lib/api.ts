export const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://localhost:8080";

export type ApiResult<T> =
  | { ok: true; data: T }
  | { ok: false; error: string };

export type DashboardStats = {
  totalLeads: number;
  openTickets: number;
  overdueInvoices: number;
  pendingTasks: number;
};

export type Lead = {
  id: number;
  name: string;
  email: string;
  company: string;
  notes: string;
  status: string;
};

export type SupportTicket = {
  id: number;
  subject: string;
  description: string;
  customerEmail: string;
  status: string;
  priority: string;
};

export type Invoice = {
  id: number;
  invoiceNumber: string;
  customerName: string;
  customerEmail: string;
  amount: number;
  dueDate: string;
  status: string;
};

export type AgentWorkflowResponse = {
  summary: string;
  steps: string[];
  results: Record<string, unknown>[];
};

async function fetchJsonSafe<T>(
  path: string,
  init?: RequestInit,
): Promise<ApiResult<T>> {
  try {
    const response = await fetch(`${API_BASE_URL}${path}`, {
      ...init,
      headers: {
        "Content-Type": "application/json",
        ...(init?.headers ?? {}),
      },
      cache: "no-store",
    });

    if (!response.ok) {
      return { ok: false, error: `Request failed: ${response.status}` };
    }

    const data = (await response.json()) as T;
    return { ok: true, data };
  } catch {
    return {
      ok: false,
      error: `Cannot reach backend at ${API_BASE_URL}. Start it with: cd backend && mvn spring-boot:run`,
    };
  }
}

async function fetchJson<T>(path: string, init?: RequestInit): Promise<T> {
  const result = await fetchJsonSafe<T>(path, init);
  if (!result.ok) {
    throw new Error(result.error);
  }
  return result.data;
}

export function getDashboardStats() {
  return fetchJsonSafe<DashboardStats>("/api/dashboard/stats");
}

export function getLeads() {
  return fetchJsonSafe<Lead[]>("/api/leads");
}

export function getTickets() {
  return fetchJsonSafe<SupportTicket[]>("/api/tickets");
}

export function getInvoices() {
  return fetchJsonSafe<Invoice[]>("/api/invoices");
}

export function runAgentWorkflow(query: string) {
  return fetchJson<AgentWorkflowResponse>("/api/agents/workflow", {
    method: "POST",
    body: JSON.stringify({ query }),
  });
}
