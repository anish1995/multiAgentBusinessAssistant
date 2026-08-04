# Software Requirements Specification (SRS)

## Multi-Agent Business Assistant

| Field | Value |
|-------|-------|
| **Document version** | 1.1 |
| **Date** | August 4, 2026 |
| **Project** | Multi-Agent Business Assistant |
| **Status** | Baseline (includes JWT refresh tokens) |

---

## 1. Introduction

### 1.1 What is an SRS?

A **Software Requirements Specification (SRS)** is a formal document that describes **what** a software system must do—not how it is built. It captures:

- Business goals and scope
- Functional requirements (features and behaviors)
- Non-functional requirements (performance, security, reliability)
- User roles and use cases
- Constraints, assumptions, and dependencies

Stakeholders (product owners, developers, testers, and operators) use an SRS to align on scope, plan implementation, write tests, and validate that the delivered system meets expectations.

### 1.2 Purpose of this document

This SRS defines the requirements for the **Multi-Agent Business Assistant**: an enterprise-style web application that lets business users monitor operations (leads, support tickets, invoices, tasks) and orchestrate AI agents to automate workflows such as collections, triage, and policy lookup.

### 1.3 Intended audience

- Product and engineering teams
- QA / test engineers
- DevOps and deployment owners
- Portfolio reviewers and technical stakeholders

### 1.4 Scope

The system provides:

1. A **web dashboard** for authenticated users
2. A **REST API** for business data and authentication
3. An **AI orchestration service** that coordinates specialized agents
4. **Persistent storage** in PostgreSQL

Out of scope for the current baseline (may be future enhancements):

- Native mobile applications
- Direct SMTP email delivery (reminders are drafted, not sent via mail server)
- Third-party CRM/ERP integrations (Salesforce, SAP, etc.)
- Multi-tenant organization isolation

### 1.5 Definitions and acronyms

| Term | Definition |
|------|------------|
| **SRS** | Software Requirements Specification |
| **JWT** | JSON Web Token used for stateless API authentication (short-lived access token) |
| **Refresh token** | Long-lived opaque token stored hashed in PostgreSQL; used to obtain new access tokens |
| **Token rotation** | On each refresh, the prior refresh token is revoked and a new one is issued |
| **RAG** | Retrieval-Augmented Generation; document-grounded AI answers |
| **Manager Agent** | Orchestrator that routes work to specialized agents |
| **Agent Console** | UI where users submit natural-language workflow requests |
| **Lead** | Sales prospect record |
| **Task** | Follow-up action item, often created by agent workflows |

### 1.6 References

- Project README: `README.md`
- API implementation: `backend/`, `ai-services/`, `frontend/`
- Architecture overview: Section 4 of this document

---

## 2. Overall description

### 2.1 Product perspective

The system is a **three-tier application**:

```text
┌─────────────────┐     JWT REST      ┌──────────────────┐     REST + API Key   ┌─────────────────┐
│  Next.js        │ ────────────────► │  Spring Boot     │ ───────────────────► │  FastAPI        │
│  Frontend       │                   │  Backend         │                    │  AI Services    │
│  (port 3000)    │                   │  (port 8080)     │                    │  (port 8000)    │
└─────────────────┘                   └────────┬─────────┘                    └────────┬────────┘
                                             │                                      │
                                             ▼                                      │ callback
                                      ┌──────────────┐                             │
                                      │ PostgreSQL   │ ◄───────────────────────────┘
                                      └──────────────┘   (internal task API)
```

### 2.2 Product functions (summary)

| Function | Description |
|----------|-------------|
| Authentication | Login, optional registration, short-lived JWT + refresh token with rotation |
| Dashboard | KPI stats: leads, tickets, overdue invoices, pending tasks |
| Lead management | View, search, export; admin CRUD via API |
| Support tickets | View, search, detail modal; admin CRUD via API |
| Invoice management | View, search; send reminders via agent workflow |
| Task management | View tasks, mark complete |
| Agent orchestration | Natural-language workflows via Manager + specialized agents |
| Knowledge lookup | Policy/document Q&A via RAG (when OpenAI key configured) |
| Health monitoring | API health with database and AI service checks |

### 2.3 User classes and characteristics

| User class | Role | Typical activities |
|------------|------|-------------------|
| **Admin** | `ADMIN` | Full API access including create/update/delete; run workflows; send reminders |
| **User** | `USER` | View data, run agent workflows, manage own session |
| **System (internal)** | Service account | AI services create tasks via internal API key |

### 2.4 Operating environment

| Component | Environment |
|-----------|-------------|
| Client | Modern browsers (Chrome, Edge, Firefox); desktop-first responsive UI |
| Backend | Java 21, Spring Boot 3.4, PostgreSQL 12+ |
| AI services | Python 3.12, FastAPI, optional OpenAI API |
| Deployment | Local dev, Docker Compose, or cloud VMs/containers |

### 2.5 Design and implementation constraints

- Backend must use PostgreSQL for persistence (not in-memory DB in production).
- Authentication must be stateless JWT for API access; no server-side HTTP sessions.
- Access JWT lifetime defaults to 15 minutes; refresh token lifetime defaults to 7 days.
- Refresh tokens must be stored hashed in PostgreSQL and rotated on each use.
- Frontend must attempt silent token refresh once on HTTP 401 before forcing re-login.
- AI orchestration endpoint must require a shared internal API key.
- Schema changes must be managed via Flyway migrations.
- Frontend must attach JWT to all protected API calls.

### 2.6 Assumptions and dependencies

| Assumption / dependency | Notes |
|-------------------------|-------|
| PostgreSQL is available | Database `businessassistant` must exist or be provisioned |
| OpenAI API (optional) | Enables LLM-enhanced agents and RAG embeddings; system degrades gracefully without it |
| Network connectivity | Frontend ↔ backend ↔ AI services on configured ports |
| Single deployment region | No geo-distribution requirement in baseline |

---

## 3. System features and functional requirements

Requirements use IDs for traceability: **FR** = functional, **NFR** = non-functional.

### 3.1 Authentication and authorization

| ID | Requirement | Priority |
|----|-------------|----------|
| FR-AUTH-01 | The system shall provide `POST /api/auth/login` accepting email and password. | Must |
| FR-AUTH-02 | On successful login or registration, the system shall return an access JWT, a refresh token, token type, access expiration, refresh expiration, email, full name, and role. | Must |
| FR-AUTH-03 | The system shall protect all `/api/*` endpoints except `/api/health` and `/api/auth/*` with access JWT validation. | Must |
| FR-AUTH-04 | The system shall support optional registration via `POST /api/auth/register` when `REGISTRATION_ENABLED=true`. | Should |
| FR-AUTH-05 | The system shall hash passwords with BCrypt before storage. | Must |
| FR-AUTH-06 | Admin-only write operations shall require role `ADMIN` (`@PreAuthorize`). | Must |
| FR-AUTH-07 | The frontend shall redirect unauthenticated users to `/login`. | Must |
| FR-AUTH-08 | The frontend shall store access and refresh tokens (localStorage + cookies for SSR) and clear both on logout. | Must |
| FR-AUTH-09 | Access JWT default lifetime shall be 15 minutes (`JWT_ACCESS_EXPIRATION_MS`, default 900000). | Must |
| FR-AUTH-10 | Refresh token default lifetime shall be 7 days (`JWT_REFRESH_EXPIRATION_MS`, default 604800000). | Must |
| FR-AUTH-11 | Refresh tokens shall be stored in PostgreSQL as SHA-256 hashes (plain token never stored). | Must |
| FR-AUTH-12 | The system shall provide `POST /api/auth/refresh` accepting a refresh token and returning a new access JWT and a new refresh token. | Must |
| FR-AUTH-13 | On refresh, the system shall revoke the presented refresh token and issue a rotated replacement (one-time use). | Must |
| FR-AUTH-14 | The system shall provide `POST /api/auth/logout` to revoke the presented refresh token. | Must |
| FR-AUTH-15 | On HTTP 401 from a protected API, the frontend shall attempt refresh once, retry the request, then logout if refresh fails. | Must |

### 3.2 Dashboard

| ID | Requirement | Priority |
|----|-------------|----------|
| FR-DASH-01 | The dashboard shall display total leads, open tickets, overdue invoices, and pending tasks. | Must |
| FR-DASH-02 | The dashboard shall show system status for API, PostgreSQL, and AI orchestrator. | Should |
| FR-DASH-03 | The dashboard shall greet the user by name from the authenticated session. | Should |

### 3.3 Leads (Sales)

| ID | Requirement | Priority |
|----|-------------|----------|
| FR-LEAD-01 | The system shall list leads via `GET /api/leads` with optional `search` query parameter. | Must |
| FR-LEAD-02 | Admins shall create, update, and delete leads via REST API. | Must |
| FR-LEAD-03 | The UI shall display leads in a table with name, company, email, and status. | Must |
| FR-LEAD-04 | The UI shall export leads to CSV. | Should |

### 3.4 Support tickets

| ID | Requirement | Priority |
|----|-------------|----------|
| FR-TKT-01 | The system shall list tickets via `GET /api/tickets` with optional search. | Must |
| FR-TKT-02 | Admins shall create, update, and delete tickets via REST API. | Must |
| FR-TKT-03 | The UI shall show ticket subject, description, status, priority, and customer email. | Must |
| FR-TKT-04 | The UI shall open a detail modal for a selected ticket. | Should |

### 3.5 Invoices (Finance)

| ID | Requirement | Priority |
|----|-------------|----------|
| FR-INV-01 | The system shall list invoices via `GET /api/invoices` with optional search. | Must |
| FR-INV-02 | The system shall list overdue invoices via `GET /api/invoices/overdue`. | Must |
| FR-INV-03 | Admins shall create, update, and delete invoices via REST API. | Must |
| FR-INV-04 | Admins shall trigger reminder workflow via `POST /api/invoices/send-reminders`. | Must |
| FR-INV-05 | The UI shall display invoice number, customer, amount, due date, and status. | Must |

### 3.6 Tasks

| ID | Requirement | Priority |
|----|-------------|----------|
| FR-TASK-01 | The system shall list tasks via `GET /api/tasks` with optional search. | Must |
| FR-TASK-02 | Admins shall create, update, and delete tasks via REST API. | Must |
| FR-TASK-03 | AI workflows shall persist follow-up tasks to PostgreSQL (backend parse + AI callback). | Must |
| FR-TASK-04 | Internal API `POST /api/internal/tasks` shall accept tasks with `X-Internal-Api-Key`. | Must |
| FR-TASK-05 | The UI shall list tasks and allow marking pending tasks as completed. | Must |

### 3.7 AI agent orchestration

| ID | Requirement | Priority |
|----|-------------|----------|
| FR-AI-01 | Users shall submit workflow requests via `POST /api/agents/workflow` with a natural-language query. | Must |
| FR-AI-02 | The backend shall attach business context (overdue invoices, open tickets, leads) to orchestration requests. | Must |
| FR-AI-03 | The Manager agent shall delegate to Sales, Support, Finance, and Knowledge agents. | Must |
| FR-AI-04 | When `OPENAI_API_KEY` is set, agents shall use LLM for recommendations, reminders, routing, and summaries. | Should |
| FR-AI-05 | When OpenAI is unavailable, agents shall fall back to rule-based logic without failing the request. | Must |
| FR-AI-06 | The Knowledge agent shall answer policy questions using ChromaDB RAG over ingested markdown documents. | Should |
| FR-AI-07 | `POST /api/v1/orchestrate` shall require valid `X-Internal-Api-Key`. | Must |
| FR-AI-08 | The Agent Console shall display summary, workflow steps, and structured agent output. | Must |
| FR-AI-09 | Example workflow: find overdue invoices, draft reminders, create follow-up tasks. | Must |

### 3.8 Search and navigation

| ID | Requirement | Priority |
|----|-------------|----------|
| FR-NAV-01 | The top bar search shall query leads by keyword. | Should |
| FR-NAV-02 | "New workflow" shall navigate to the Agent Console. | Should |
| FR-NAV-03 | Sidebar shall provide links to Dashboard, Leads, Support, Invoices, Tasks, Agent Console. | Must |

### 3.9 Data seeding (development / demo)

| ID | Requirement | Priority |
|----|-------------|----------|
| FR-SEED-01 | On empty database, the system may seed demo admin user and sample business data when `SEED_DATA_ENABLED=true`. | Should |
| FR-SEED-02 | Default demo admin: `admin@businessassistant.com` / `admin123`. | Should |

---

## 4. External interface requirements

### 4.1 User interfaces

| Screen | Route | Primary actions |
|--------|-------|-----------------|
| Login | `/login` | Sign in, link to register |
| Register | `/register` | Create account (if enabled) |
| Dashboard | `/` | View KPIs, system status, agent overview |
| Leads | `/leads` | View, search, export |
| Tickets | `/tickets` | View, detail modal |
| Invoices | `/invoices` | View, send reminders |
| Tasks | `/tasks` | View, mark complete |
| Agent Console | `/agents` | Run workflow, view results |

### 4.2 REST API (backend)

**Public (authentication)**

| Method | Path | Description |
|--------|------|-------------|
| GET | `/api/health` | Health + component status |
| POST | `/api/auth/login` | Login; returns access JWT + refresh token |
| POST | `/api/auth/register` | Register (if enabled); returns access JWT + refresh token |
| POST | `/api/auth/refresh` | Exchange refresh token for new access JWT + rotated refresh token |
| POST | `/api/auth/logout` | Revoke refresh token |

**Login / refresh response (`AuthResponse`)**

| Field | Description |
|-------|-------------|
| `token` | Short-lived access JWT (Bearer) |
| `refreshToken` | Long-lived opaque refresh token |
| `tokenType` | `Bearer` |
| `expiresInMs` | Access token lifetime in milliseconds |
| `refreshExpiresInMs` | Refresh token lifetime in milliseconds |
| `email`, `fullName`, `role` | User profile fields |

**Refresh / logout request body**

```json
{ "refreshToken": "<opaque refresh token>" }
```

**Authenticated (access JWT)**

| Method | Path | Description |
|--------|------|-------------|
| GET | `/api/dashboard/stats` | Dashboard KPIs |
| GET/POST/PUT/DELETE | `/api/leads`, `/api/leads/{id}` | Leads |
| GET/POST/PUT/DELETE | `/api/tickets`, `/api/tickets/{id}` | Tickets |
| GET/POST/PUT/DELETE | `/api/invoices`, `/api/invoices/{id}` | Invoices |
| GET | `/api/invoices/overdue` | Overdue invoices |
| POST | `/api/invoices/send-reminders` | Reminder workflow (ADMIN) |
| GET/POST/PUT/DELETE | `/api/tasks`, `/api/tasks/{id}` | Tasks |
| POST | `/api/agents/workflow` | Run agent workflow |

**Internal (API key)**

| Method | Path | Header | Description |
|--------|------|--------|-------------|
| POST | `/api/internal/tasks` | `X-Internal-Api-Key` | Create task from AI service |

### 4.3 AI services API

| Method | Path | Auth | Description |
|--------|------|------|-------------|
| GET | `/api/health` | None | Service health + `llmEnabled` flag |
| POST | `/api/v1/orchestrate` | `X-Internal-Api-Key` | Run multi-agent workflow |

### 4.4 Communication interfaces

| From | To | Protocol | Auth |
|------|-----|----------|------|
| Browser | Backend | HTTP REST | JWT Bearer |
| Backend | PostgreSQL | JDBC | DB credentials |
| Backend | AI services | HTTP REST | `X-Internal-Api-Key` |
| AI services | Backend | HTTP REST | `X-Internal-Api-Key` |
| AI services | OpenAI (optional) | HTTPS | API key |

---

## 5. Non-functional requirements

### 5.1 Security

| ID | Requirement |
|----|-------------|
| NFR-SEC-01 | JWT secret must be configurable via environment variable; default not used in production. |
| NFR-SEC-02 | Internal API key must be shared only between backend and AI services. |
| NFR-SEC-03 | CORS shall restrict browser origins to configured frontend URL(s). |
| NFR-SEC-04 | Invalid or expired access JWT shall return HTTP 401. |
| NFR-SEC-05 | Registration shall be disableable in production (`REGISTRATION_ENABLED=false`). |
| NFR-SEC-06 | Refresh tokens shall be revocable server-side (logout and rotation). |
| NFR-SEC-07 | Expired or revoked refresh tokens shall return HTTP 401 on `/api/auth/refresh`. |
| NFR-SEC-08 | Concurrent 401 responses in the frontend shall share a single refresh attempt (no refresh storms). |

### 5.2 Performance and scalability

| ID | Requirement |
|----|-------------|
| NFR-PERF-01 | Dashboard and list pages shall load within 3 seconds on local/dev network. |
| NFR-PERF-02 | Agent workflows may take up to 60 seconds when LLM is enabled (user feedback via loading state). |
| NFR-PERF-03 | System is designed for small-team / demo scale; horizontal scaling not required in baseline. |

### 5.3 Reliability and availability

| ID | Requirement |
|----|-------------|
| NFR-REL-01 | If AI services are down, workflow API shall return a clear error without crashing the backend. |
| NFR-REL-02 | Health endpoint shall report database and AI service connectivity. |
| NFR-REL-03 | Business data shall persist across backend restarts (PostgreSQL). |

### 5.4 Maintainability

| ID | Requirement |
|----|-------------|
| NFR-MAIN-01 | Database schema changes shall use Flyway versioned migrations. |
| NFR-MAIN-02 | Backend shall include at least one Spring Boot context load test. |
| NFR-MAIN-03 | Configuration shall be externalized via environment variables. |

### 5.5 Usability

| ID | Requirement |
|----|-------------|
| NFR-USE-01 | UI shall show clear errors when backend is unreachable. |
| NFR-USE-02 | Agent Console shall provide example prompts and quick suggestions. |
| NFR-USE-03 | UI shall be responsive for desktop and tablet widths. |

---

## 6. Use cases

### UC-01: User login

**Actor:** Business user  
**Precondition:** User has valid credentials  
**Flow:**

1. User opens the application.
2. System redirects to login if no valid access or refresh token.
3. User enters email and password and clicks Sign in.
4. System validates credentials and returns access JWT (15 min) and refresh token (7 days).
5. Frontend stores both tokens and redirects to the dashboard.

**Postcondition:** User session is established; protected APIs are accessible with the access JWT.

### UC-01b: Silent session refresh

**Actor:** Authenticated user  
**Precondition:** Access JWT expired but refresh token is valid and not revoked  
**Flow:**

1. User performs an action that calls a protected API (e.g. load dashboard stats).
2. Backend returns HTTP 401 (access JWT expired).
3. Frontend calls `POST /api/auth/refresh` with the stored refresh token.
4. Backend revokes the old refresh token, issues new access JWT and rotated refresh token.
5. Frontend updates stored tokens and retries the original API call.
6. User continues without seeing the login page.

**Postcondition:** Session extended without re-entering credentials.

**Alternate flow:** If refresh fails (expired, revoked, or invalid token), frontend clears session and redirects to `/login`.

### UC-01c: User logout

**Actor:** Authenticated user  
**Flow:**

1. User clicks Logout in the sidebar.
2. Frontend calls `POST /api/auth/logout` with the refresh token.
3. Backend marks the refresh token as revoked in PostgreSQL.
4. Frontend clears access and refresh tokens and redirects to `/login`.

**Postcondition:** Refresh token cannot be used to obtain new access tokens.

### UC-02: Run collections workflow

**Actor:** Admin or authenticated user  
**Precondition:** User is logged in; AI services are running  
**Flow:**

1. User opens Agent Console.
2. User enters: "Find overdue invoices, draft reminder emails, and create follow-up tasks."
3. Backend loads overdue invoices, open tickets, and leads as context.
4. Manager agent activates Finance (and related) agents.
5. Finance agent drafts reminder content; Manager creates tasks in PostgreSQL.
6. UI displays summary, steps, and JSON agent output.

**Postcondition:** Tasks appear on Tasks page; reminder content available in workflow output.

### UC-03: Send invoice reminders (admin)

**Actor:** Admin  
**Precondition:** User logged in as ADMIN  
**Flow:**

1. Admin opens Invoices page.
2. Admin clicks "Send reminders."
3. System runs the same collections workflow as UC-02.
4. UI shows workflow summary message.

### UC-04: Policy lookup

**Actor:** Authenticated user  
**Precondition:** Knowledge documents ingested; optional OpenAI for RAG  
**Flow:**

1. User asks in Agent Console: "What is our invoice escalation policy?"
2. Manager selects Knowledge agent.
3. Knowledge agent retrieves from ChromaDB and answers with sources.
4. Answer displayed in agent output.

---

## 7. Data requirements

### 7.1 Core entities

| Entity | Key attributes |
|--------|----------------|
| User | email, password (hash), fullName, role, createdAt |
| RefreshToken | userId, tokenHash, expiresAt, revoked, createdAt |
| Lead | name, email, company, notes, status, createdAt |
| SupportTicket | subject, description, customerEmail, status, priority, createdAt |
| Invoice | invoiceNumber, customerName, customerEmail, amount, dueDate, status, createdAt |
| Task | title, description, assignedAgent, status, createdAt |

### 7.2 Enumerations

| Domain | Values |
|--------|--------|
| UserRole | ADMIN, USER |
| LeadStatus | NEW, CONTACTED, QUALIFIED, LOST, WON |
| TicketStatus | OPEN, IN_PROGRESS, RESOLVED, CLOSED |
| InvoiceStatus | DRAFT, SENT, OVERDUE, PAID, CANCELLED |
| Task status | PENDING, COMPLETED (string) |

---

## 8. Deployment requirements

| Variable | Required | Description |
|----------|----------|-------------|
| `DB_HOST`, `DB_PORT`, `DB_NAME`, `DB_USER`, `DB_PASSWORD` | Yes | PostgreSQL connection |
| `JWT_SECRET` | Yes (prod) | Access JWT signing key |
| `JWT_ACCESS_EXPIRATION_MS` | Optional | Access token TTL (default 900000 = 15 min) |
| `JWT_REFRESH_EXPIRATION_MS` | Optional | Refresh token TTL (default 604800000 = 7 days) |
| `INTERNAL_API_KEY` | Yes (prod) | Backend ↔ AI services |
| `CORS_ORIGINS` | Yes | Frontend origin(s) |
| `AI_SERVICES_URL` | Yes | Backend → AI base URL |
| `OPENAI_API_KEY` | Optional | LLM + RAG |
| `REGISTRATION_ENABLED` | Optional | Default `true` |
| `SEED_DATA_ENABLED` | Optional | Demo data on startup |
| `NEXT_PUBLIC_API_BASE_URL` | Yes (frontend) | Backend URL for browser |
| `NEXT_PUBLIC_AI_BASE_URL` | Optional | AI health check URL |

Docker Compose shall orchestrate: PostgreSQL, backend, ai-services, frontend.

---

## 9. Acceptance criteria (summary)

The system is considered to meet this SRS baseline when:

1. ✅ User can log in with access JWT + refresh token and access protected pages.
2. ✅ Expired access JWT triggers one automatic refresh attempt before re-login.
3. ✅ Refresh token rotation revokes the previous token on each refresh.
4. ✅ Logout revokes refresh token server-side.
5. ✅ Dashboard shows live stats from PostgreSQL.
6. ✅ Leads, tickets, invoices, and tasks are viewable and searchable.
7. ✅ Agent workflow runs end-to-end and persists follow-up tasks.
8. ✅ Invoice reminder workflow is triggerable from the UI.
9. ✅ AI orchestration requires internal API key; health checks report DB and AI status.
10. ✅ Flyway manages schema (including `refresh_tokens`); demo seeding is configurable.
11. ⚠️ Email delivery via SMTP is **not** required in this baseline (draft only).
12. ⚠️ Admin CRUD **forms** in UI are **not** required (API-level CRUD is sufficient for baseline).

---

## 10. Revision history

| Version | Date | Author | Changes |
|---------|------|--------|---------|
| 1.0 | 2026-08-04 | Project team | Initial SRS baseline aligned with implemented system |
| 1.1 | 2026-08-04 | Project team | Added JWT refresh tokens: 15 min access, 7 day refresh, DB storage, rotation, `/api/auth/refresh` and `/api/auth/logout`, frontend silent refresh on 401 |

---

## Appendix A: Agent responsibilities

| Agent | Responsibility | Primary data |
|-------|----------------|--------------|
| Manager | Route query, coordinate agents, create tasks, summarize | All context |
| Sales | Lead pipeline recommendations | Leads |
| Support | Ticket triage recommendations | Open tickets |
| Finance | Overdue invoice reminders | Overdue invoices |
| Knowledge | Policy/document Q&A | RAG document store |

## Appendix B: Known limitations (future enhancements)

- SMTP integration for sending reminder emails
- Admin UI forms for create/edit/delete entities
- HttpOnly-only refresh token cookies (tokens currently also in localStorage for client refresh)
- Rate limiting and API audit logging
- Multi-tenant organizations and fine-grained permissions
- CI/CD pipeline and integration test suite expansion
- HTTPS termination and production reverse proxy templates
