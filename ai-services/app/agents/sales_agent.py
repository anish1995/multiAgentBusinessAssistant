from typing import Any

from app.agents.base import BaseAgent
from app.services.llm_service import invoke_llm


class SalesAgent(BaseAgent):
    name = "sales"
    description = "Handles leads and sales follow-ups."

    def run(self, query: str, context: dict[str, Any]) -> dict[str, Any]:
        leads = context.get("leads", [])
        fallback = "Prioritize qualified leads for outreach this week."
        recommendation = invoke_llm(
            "You are a sales operations assistant. Provide one actionable recommendation.",
            f"User request: {query}\nLeads in pipeline: {len(leads)}",
            fallback,
        )
        return {
            "agent": self.name,
            "action": "review_leads",
            "lead_count": len(leads),
            "recommendation": recommendation,
        }
