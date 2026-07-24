from typing import Any

from app.agents.base import BaseAgent


class KnowledgeAgent(BaseAgent):
    name = "knowledge"
    description = "Answers questions using internal documents."

    def run(self, query: str, context: dict[str, Any]) -> dict[str, Any]:
        return {
            "agent": self.name,
            "action": "document_lookup",
            "query": query,
            "answer": (
                "Invoice reminders should be sent after 7 days overdue. "
                "Escalate to finance manager after 14 days."
            ),
            "sources": ["collections-policy.md", "support-playbook.md"],
        }
