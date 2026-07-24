from typing import Any

from app.agents.finance_agent import FinanceAgent
from app.agents.knowledge_agent import KnowledgeAgent
from app.agents.sales_agent import SalesAgent
from app.agents.support_agent import SupportAgent
from app.models import OrchestrationResponse


class ManagerAgent:
    name = "manager"
    description = "Coordinates specialized agents for multi-step business workflows."

    def __init__(self) -> None:
        self.agents = {
            "sales": SalesAgent(),
            "support": SupportAgent(),
            "finance": FinanceAgent(),
            "knowledge": KnowledgeAgent(),
        }

    def orchestrate(self, query: str, context: dict[str, Any]) -> OrchestrationResponse:
        lowered = query.lower()
        selected = []

        if "invoice" in lowered or "overdue" in lowered or "payment" in lowered:
            selected.append("finance")
        if "ticket" in lowered or "support" in lowered:
            selected.append("support")
        if "lead" in lowered or "sales" in lowered:
            selected.append("sales")
        if "document" in lowered or "policy" in lowered or "?" in query:
            selected.append("knowledge")

        if not selected:
            selected = ["finance", "support", "sales"]

        steps = [f"Manager delegated work to {agent_name} agent" for agent_name in selected]
        results = [self.agents[agent_name].run(query, context) for agent_name in selected]

        if "task" in lowered or "follow-up" in lowered or "follow up" in lowered:
            steps.append("Manager created follow-up tasks from finance output")
            results.append(
                {
                    "agent": self.name,
                    "action": "create_follow_up_tasks",
                    "tasks": [
                        {
                            "title": "Send invoice reminder",
                            "assigned_agent": "finance",
                            "status": "PENDING",
                        }
                    ],
                }
            )

        summary = (
            "Completed multi-agent workflow for your business request. "
            f"Activated agents: {', '.join(selected)}."
        )
        return OrchestrationResponse(summary=summary, steps=steps, results=results)
