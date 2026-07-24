from typing import Any

from app.agents.base import BaseAgent


class SupportAgent(BaseAgent):
    name = "support"
    description = "Handles support tickets."

    def run(self, query: str, context: dict[str, Any]) -> dict[str, Any]:
        tickets = context.get("open_tickets", [])
        return {
            "agent": self.name,
            "action": "triage_tickets",
            "open_ticket_count": len(tickets),
            "recommendation": "Resolve high-priority tickets before end of day.",
        }
