from typing import Any

from app.agents.base import BaseAgent


class SalesAgent(BaseAgent):
    name = "sales"
    description = "Handles leads and sales follow-ups."

    def run(self, query: str, context: dict[str, Any]) -> dict[str, Any]:
        leads = context.get("leads", [])
        return {
            "agent": self.name,
            "action": "review_leads",
            "lead_count": len(leads),
            "recommendation": "Prioritize qualified leads for outreach this week.",
        }
