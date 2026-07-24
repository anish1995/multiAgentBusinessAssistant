# Multi-Agent Business Assistant

An enterprise-style full-stack project that demonstrates AI agents, workflow orchestration, and multi-tier architecture.

## Architecture

```text
frontend/      Next.js dashboard
backend/       Spring Boot APIs, business data, auth-ready layer
ai-services/   Python multi-agent orchestration, LLM/RAG integration
```

### Agents

| Agent | Responsibility |
| --- | --- |
| Sales | Handle leads |
| Support | Handle support tickets |
| Finance | Handle invoices and reminders |
| Knowledge | Answer questions from documents |
| Manager | Coordinate all agents |

### Example workflow

User request:

> Find overdue invoices, draft reminder emails, and create follow-up tasks.

Flow:

1. Next.js sends the request to Spring Boot
2. Spring Boot loads business context and forwards to Python
3. Manager agent delegates to Finance/Support/Sales/Knowledge agents
4. Results return to the dashboard Agent Console

## Quick start

### 1. AI services (Python)

**Easiest way (Windows):**

```bash
cd ai-services
run.bat
```

Or manually:

```bash
cd ai-services
python -m venv .venv
.venv\Scripts\activate
pip install -r requirements.txt
copy .env.example .env
python -m uvicorn app.main:app --reload --port 8000
```

> Use `python -m uvicorn` instead of `uvicorn` directly — the module runs from your virtual environment without needing it on PATH.

Optional LLM/RAG packages:

```bash
pip install -r requirements-ml.txt
```

### 2. Backend (Spring Boot)

```bash
cd backend
mvn spring-boot:run
```

Backend runs on `http://localhost:8080`.

### 3. Frontend (Next.js)

```bash
cd frontend
copy .env.example .env.local
npm install
npm run dev
```

Frontend runs on `http://localhost:3000`.

## API overview

### Backend (`:8080`)

- `GET /api/health`
- `GET /api/dashboard/stats`
- `GET /api/leads`
- `GET /api/tickets`
- `GET /api/invoices`
- `POST /api/agents/workflow`

### AI services (`:8000`)

- `GET /api/health`
- `POST /api/v1/orchestrate`

## Next steps

- Add JWT authentication in Spring Boot
- Connect OpenAI/LangChain in `ai-services`
- Add document ingestion and ChromaDB RAG for Knowledge Agent
- Replace H2 with PostgreSQL for production
- Add Docker Compose for one-command startup

## Tech stack

- **Frontend:** Next.js, TypeScript, Tailwind CSS
- **Backend:** Spring Boot, Spring Security, Spring Data JPA
- **AI:** FastAPI, Python agents, LangChain/OpenAI ready
