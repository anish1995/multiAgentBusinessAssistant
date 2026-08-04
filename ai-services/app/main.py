from contextlib import asynccontextmanager

from fastapi import Depends, FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.agents.manager_agent import ManagerAgent
from app.auth import verify_internal_api_key
from app.config import settings
from app.models import OrchestrationRequest, OrchestrationResponse
from app.services.knowledge_store import knowledge_store

manager = ManagerAgent()


@asynccontextmanager
async def lifespan(_: FastAPI):
    knowledge_store.ingest_documents()
    yield


app = FastAPI(
    title="Multi-Agent Business Assistant AI Services",
    version="0.2.0",
    lifespan=lifespan,
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000", "http://127.0.0.1:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.get("/api/health")
def health() -> dict[str, str | bool]:
    return {
        "status": "UP",
        "service": "business-assistant-ai-services",
        "llmEnabled": settings.llm_enabled(),
    }


@app.post("/api/v1/orchestrate", response_model=OrchestrationResponse)
def orchestrate(
    request: OrchestrationRequest,
    _: None = Depends(verify_internal_api_key),
) -> OrchestrationResponse:
    return manager.orchestrate(request.query, request.context)
