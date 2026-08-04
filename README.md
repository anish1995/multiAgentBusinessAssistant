# Multi-Agent Business Assistant

An enterprise-style full-stack project with JWT auth, PostgreSQL, and multi-agent AI orchestration.

## Architecture

```text
frontend/      Next.js dashboard (login, CRUD views, agent console)
backend/       Spring Boot APIs, JWT, PostgreSQL, workflow orchestration
ai-services/   FastAPI multi-agent orchestration (LLM + RAG when OpenAI key set)
```

## Quick start

### 1. PostgreSQL

Create the database:

```sql
CREATE DATABASE businessassistant;
```

### 2. Backend

```bash
cd backend
# Optional: copy .env.example values into environment variables
mvn spring-boot:run
```

Defaults: `postgres/postgres` on `localhost:5432`.

### 3. AI services

```bash
cd ai-services
python -m venv .venv
.venv\Scripts\activate
pip install -r requirements.txt
copy .env.example .env
python -m uvicorn app.main:app --reload --port 8000
```

Set `OPENAI_API_KEY` in `.env` for LLM-enhanced agents and RAG embeddings.

### 4. Frontend

```bash
cd frontend
npm install
npm run dev
```

Login: `admin@businessassistant.com` / `admin123` (seeded on first run).

### Docker Compose

```bash
docker compose up --build
```

## API overview

### Backend (`:8080`)

- `GET /api/health` — database + AI service status
- `POST /api/auth/login`, `POST /api/auth/register`
- `GET/POST/PUT/DELETE /api/leads`, `/api/tickets`, `/api/invoices`, `/api/tasks`
- `POST /api/invoices/send-reminders`
- `POST /api/agents/workflow`

### AI services (`:8000`)

- `GET /api/health`
- `POST /api/v1/orchestrate` (requires `X-Internal-Api-Key` header)

## Production configuration

Set these environment variables:

| Variable | Purpose |
|----------|---------|
| `JWT_SECRET` | JWT signing secret (32+ chars) |
| `INTERNAL_API_KEY` | Shared key between backend and AI services |
| `DB_*` | PostgreSQL connection |
| `OPENAI_API_KEY` | Enables LLM agents and RAG embeddings |
| `REGISTRATION_ENABLED` | `false` to disable public signup |
| `SEED_DATA_ENABLED` | `false` to disable demo data seeding |

## Tech stack

- **Frontend:** Next.js, TypeScript, Tailwind CSS
- **Backend:** Spring Boot, Spring Security (JWT), Flyway, PostgreSQL
- **AI:** FastAPI, LangChain, OpenAI, ChromaDB
