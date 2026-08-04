from typing import Any

from app.agents.base import BaseAgent
from app.services.llm_service import invoke_llm


class SupportAgent(BaseAgent):
    name = "support"
    description = "Handles support tickets."

    def run(self, query: str, context: dict[str, Any]) -> dict[str, Any]:
        tickets = context.get("open_tickets", [])
        fallback = "Resolve high-priority tickets before end of day."
        recommendation = invoke_llm(
            "You are a support operations assistant. Provide one triage recommendation.",
            f"User request: {query}\nOpen tickets: {len(tickets)}",
            fallback,
        )
        return {
            "agent": self.name,
            "action": "triage_tickets",
            "open_ticket_count": len(tickets),
            "recommendation": recommendation,
        }
