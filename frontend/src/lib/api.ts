import {
  clearSession,
  getRefreshToken,
  logoutLocal,
  setSession,
  type AuthResponse,
} from "@/lib/auth";

function resolvePublicBaseUrl(value: string | undefined, fallback: string): string {
  const resolved = (value ?? fallback).trim().replace(/\/+$/, "");
  return resolved || fallback;
}

export const API_BASE_URL = resolvePublicBaseUrl(
  process.env.NEXT_PUBLIC_API_BASE_URL,
  "http://localhost:8080",
);

export type ApiResult<T> =
  | { ok: true; data: T }
  | { ok: false; error: string };

export type HealthResponse = {
  status: string;
  service: string;
  components: Record<string, string>;
};

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

export type Task = {
  id: number;
  title: string;
  description: string;
  assignedAgent: string;
  status: string;
};

export type AgentWorkflowResponse = {
  summary: string;
  steps: string[];
  results: Record<string, unknown>[];
};

export type CreateTicketPayload = {
  subject: string;
  description: string;
  customerEmail: string;
  priority: string;
};

export type CreateTaskPayload = {
  title: string;
  description: string;
  assignedAgent: string;
  status?: string;
};

export type CreateLeadPayload = {
  name: string;
  email: string;
  company?: string;
  notes?: string;
  status?: string;
};

export type CreateInvoicePayload = {
  invoiceNumber: string;
  customerName: string;
  customerEmail: string;
  amount: number;
  dueDate: string;
  status?: string;
};

let refreshPromise: Promise<boolean> | null = null;

async function getAuthHeaders(): Promise<Record<string, string>> {
  if (typeof window !== "undefined") {
    const token = localStorage.getItem("auth_token");
    return token ? { Authorization: `Bearer ${token}` } : {};
  }

  const { cookies } = await import("next/headers");
  const cookieStore = await cookies();
  const token = cookieStore.get("auth_token")?.value;
  return token ? { Authorization: `Bearer ${token}` } : {};
}

async function refreshAccessToken(): Promise<boolean> {
  if (typeof window === "undefined") {
    return false;
  }

  const refreshToken = getRefreshToken();
  if (!refreshToken) {
    return false;
  }

  if (refreshPromise) {
    return refreshPromise;
  }

  refreshPromise = (async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/auth/refresh`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ refreshToken }),
      });

      if (!response.ok) {
        return false;
      }

      const auth = (await response.json()) as AuthResponse;
      setSession(auth);
      return true;
    } catch {
      return false;
    } finally {
      refreshPromise = null;
    }
  })();

  return refreshPromise;
}

async function fetchJsonSafe<T>(
  path: string,
  init?: RequestInit,
  retryOnUnauthorized = true,
): Promise<ApiResult<T>> {
  try {
    const authHeaders = await getAuthHeaders();
    const response = await fetch(`${API_BASE_URL}${path}`, {
      ...init,
      headers: {
        "Content-Type": "application/json",
        ...authHeaders,
        ...(init?.headers ?? {}),
      },
      cache: "no-store",
    });

    if (response.status === 401 && retryOnUnauthorized && typeof window !== "undefined") {
      const refreshed = await refreshAccessToken();
      if (refreshed) {
        return fetchJsonSafe<T>(path, init, false);
      }
      clearSession();
      window.location.href = "/login";
      return { ok: false, error: "Session expired. Please log in again." };
    }

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

export async function login(email: string, password: string): Promise<AuthResponse> {
  const response = await fetch(`${API_BASE_URL}/api/auth/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, password }),
  });

  if (!response.ok) {
    if (response.status === 401) {
      throw new Error("Invalid email or password.");
    }
    throw new Error(`Login failed: ${response.status}`);
  }

  return (await response.json()) as AuthResponse;
}

export async function register(
  email: string,
  password: string,
  fullName: string,
): Promise<AuthResponse> {
  const response = await fetch(`${API_BASE_URL}/api/auth/register`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, password, fullName }),
  });

  if (!response.ok) {
    if (response.status === 403) {
      throw new Error("Registration is currently disabled.");
    }
    if (response.status === 409) {
      throw new Error("Email is already registered.");
    }
    throw new Error(`Registration failed: ${response.status}`);
  }

  return (await response.json()) as AuthResponse;
}

export async function logout(): Promise<void> {
  const refreshToken = getRefreshToken();
  if (refreshToken) {
    try {
      await fetch(`${API_BASE_URL}/api/auth/logout`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ refreshToken }),
      });
    } catch {
      // Clear local session even if revoke request fails.
    }
  }
  logoutLocal();
}

export function getHealth() {
  return fetchJsonSafe<HealthResponse>("/api/health");
}

export function getDashboardStats() {
  return fetchJsonSafe<DashboardStats>("/api/dashboard/stats");
}

export function getLeads(search?: string) {
  const query = search ? `?search=${encodeURIComponent(search)}` : "";
  return fetchJsonSafe<Lead[]>(`/api/leads${query}`);
}

export function getTickets(search?: string) {
  const query = search ? `?search=${encodeURIComponent(search)}` : "";
  return fetchJsonSafe<SupportTicket[]>(`/api/tickets${query}`);
}

export function getInvoices(search?: string) {
  const query = search ? `?search=${encodeURIComponent(search)}` : "";
  return fetchJsonSafe<Invoice[]>(`/api/invoices${query}`);
}

export function getTasks(search?: string) {
  const query = search ? `?search=${encodeURIComponent(search)}` : "";
  return fetchJsonSafe<Task[]>(`/api/tasks${query}`);
}

export function getTask(id: number) {
  return fetchJsonSafe<Task>(`/api/tasks/${id}`);
}

export function updateTask(id: number, task: Omit<Task, "id">) {
  return fetchJson<Task>(`/api/tasks/${id}`, {
    method: "PUT",
    body: JSON.stringify({
      title: task.title,
      description: task.description,
      assignedAgent: task.assignedAgent,
      status: task.status,
    }),
  });
}

export function createTicket(payload: CreateTicketPayload) {
  return fetchJson<SupportTicket>("/api/tickets", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

export function createTask(payload: CreateTaskPayload) {
  return fetchJson<Task>("/api/tasks", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

export function createLead(payload: CreateLeadPayload) {
  return fetchJson<Lead>("/api/leads", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

export function createInvoice(payload: CreateInvoicePayload) {
  return fetchJson<Invoice>("/api/invoices", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

export function runAgentWorkflow(query: string) {
  return fetchJson<AgentWorkflowResponse>("/api/agents/workflow", {
    method: "POST",
    body: JSON.stringify({ query }),
  });
}

export function sendInvoiceReminders() {
  return fetchJson<AgentWorkflowResponse>("/api/invoices/send-reminders", {
    method: "POST",
  });
}

export async function getAiHealth(): Promise<{ ok: boolean; llmEnabled?: boolean }> {
  try {
    const aiBase = resolvePublicBaseUrl(
      process.env.NEXT_PUBLIC_AI_BASE_URL,
      "http://localhost:8000",
    );
    const response = await fetch(`${aiBase}/api/health`, { cache: "no-store" });
    if (!response.ok) {
      return { ok: false };
    }
    const data = (await response.json()) as { status?: string; llmEnabled?: boolean };
    return { ok: data.status === "UP", llmEnabled: data.llmEnabled };
  } catch {
    return { ok: false };
  }
}
