from typing import Any

from pydantic import BaseModel, Field


class OrchestrationRequest(BaseModel):
    query: str = Field(..., min_length=3)
    context: dict[str, Any] = Field(default_factory=dict)


class OrchestrationResponse(BaseModel):
    summary: str
    steps: list[str]
    results: list[dict[str, Any]]
