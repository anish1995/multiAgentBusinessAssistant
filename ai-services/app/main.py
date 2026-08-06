import logging
from contextlib import asynccontextmanager

from fastapi import Body, Depends, FastAPI, Request
from fastapi.exceptions import RequestValidationError
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse

from app.agents.manager_agent import ManagerAgent
from app.auth import verify_internal_api_key
from app.config import settings
from app.models import OrchestrationRequest, OrchestrationResponse
from app.services.knowledge_store import knowledge_store

logger = logging.getLogger("ai-services")
manager = ManagerAgent()


@asynccontextmanager
async def lifespan(_: FastAPI):
    try:
        knowledge_store.ingest_documents()
    except Exception:
        logger.exception("Knowledge store ingest failed during startup; continuing without preloaded docs")
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


@app.exception_handler(RequestValidationError)
async def validation_exception_handler(request: Request, exc: RequestValidationError):
    logger.error(
        "422 validation failed path=%s errors=%s body=%s",
        request.url.path,
        exc.errors(),
        exc.body,
    )
    return JSONResponse(
        status_code=422,
        content={
            "detail": exc.errors(),
            "body": exc.body if isinstance(exc.body, (dict, list, str, type(None))) else str(exc.body),
        },
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
    payload: OrchestrationRequest = Body(...),
    _: None = Depends(verify_internal_api_key),
) -> OrchestrationResponse:
    return manager.orchestrate(payload.query, payload.context)
