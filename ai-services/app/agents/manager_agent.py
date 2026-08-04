import json
from typing import Any

from app.agents.finance_agent import FinanceAgent
from app.agents.knowledge_agent import KnowledgeAgent
from app.agents.sales_agent import SalesAgent
from app.agents.support_agent import SupportAgent
from app.config import settings
from app.models import OrchestrationResponse
from app.services.backend_client import backend_client
from app.services.llm_service import invoke_llm


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
        selected = self._select_agents(query, context)
        steps = [f"Manager delegated work to {agent_name} agent" for agent_name in selected]
        results = [self.agents[agent_name].run(query, context) for agent_name in selected]

        if self._should_create_tasks(query):
            tasks = self._build_follow_up_tasks(query, results)
            for task in tasks:
                backend_client.create_task(
                    title=task["title"],
                    description=task.get("description"),
                    assigned_agent=task["assigned_agent"],
                    status=task.get("status", "PENDING"),
                )
            steps.append("Manager created follow-up tasks in the backend")
            results.append(
                {
                    "agent": self.name,
                    "action": "create_follow_up_tasks",
                    "tasks": tasks,
                }
            )

        summary = invoke_llm(
            "You summarize multi-agent business workflow results in one concise sentence.",
            f"User request: {query}\nActivated agents: {', '.join(selected)}",
            f"Completed multi-agent workflow. Activated agents: {', '.join(selected)}.",
        )
        return OrchestrationResponse(summary=summary, steps=steps, results=results)

    def _select_agents(self, query: str, context: dict[str, Any]) -> list[str]:
        if settings.llm_enabled():
            agent_list = ", ".join(self.agents.keys())
            response = invoke_llm(
                "Select which business agents should handle the request. "
                f"Return a JSON array of agent names from: {agent_list}. "
                "Use only valid names.",
                query,
                "[]",
            )
            try:
                parsed = json.loads(response)
                if isinstance(parsed, list):
                    selected = [name for name in parsed if name in self.agents]
                    if selected:
                        return selected
            except json.JSONDecodeError:
                pass

        lowered = query.lower()
        selected: list[str] = []
        if "invoice" in lowered or "overdue" in lowered or "payment" in lowered:
            selected.append("finance")
        if "ticket" in lowered or "support" in lowered:
            selected.append("support")
        if "lead" in lowered or "sales" in lowered:
            selected.append("sales")
        if "document" in lowered or "policy" in lowered or "?" in query:
            selected.append("knowledge")
        return selected or ["finance", "support", "sales"]

    def _should_create_tasks(self, query: str) -> bool:
        lowered = query.lower()
        return "task" in lowered or "follow-up" in lowered or "follow up" in lowered

    def _build_follow_up_tasks(self, query: str, results: list[dict[str, Any]]) -> list[dict[str, str]]:
        tasks: list[dict[str, str]] = []
        for result in results:
            if result.get("agent") == "finance" and result.get("reminder_emails"):
                for reminder in result["reminder_emails"]:
                    invoice_number = reminder.get("invoice_number", "invoice")
                    tasks.append(
                        {
                            "title": f"Send reminder for {invoice_number}",
                            "description": reminder.get("body"),
                            "assigned_agent": "finance",
                            "status": "PENDING",
                        }
                    )
        if not tasks:
            tasks.append(
                {
                    "title": "Follow up on business workflow",
                    "description": query,
                    "assigned_agent": "manager",
                    "status": "PENDING",
                }
            )
        return tasks
