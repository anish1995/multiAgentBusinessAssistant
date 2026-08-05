from typing import Any

from pydantic import BaseModel, Field, field_validator


class OrchestrationRequest(BaseModel):
    """Payload expected from the Spring backend for /api/v1/orchestrate."""

    query: str = Field(..., min_length=1)
    context: dict[str, Any] = Field(default_factory=dict)

    @field_validator("query", mode="before")
    @classmethod
    def normalize_query(cls, value: Any) -> Any:
        if isinstance(value, str):
            return value.strip()
        return value

    @field_validator("context", mode="before")
    @classmethod
    def normalize_context(cls, value: Any) -> Any:
        # Spring/Jackson may omit context or send JSON null.
        if value is None:
            return {}
        return value


class OrchestrationResponse(BaseModel):
    summary: str
    steps: list[str]
    results: list[dict[str, Any]]
