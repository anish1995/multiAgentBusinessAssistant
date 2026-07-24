from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.agents.manager_agent import ManagerAgent
from app.models import OrchestrationRequest, OrchestrationResponse

app = FastAPI(title="Multi-Agent Business Assistant AI Services", version="0.1.0")
manager = ManagerAgent()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.get("/api/health")
def health() -> dict[str, str]:
    return {"status": "UP", "service": "business-assistant-ai-services"}


@app.post("/api/v1/orchestrate", response_model=OrchestrationResponse)
def orchestrate(request: OrchestrationRequest) -> OrchestrationResponse:
    return manager.orchestrate(request.query, request.context)
