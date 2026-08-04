from typing import Any

from app.agents.base import BaseAgent
from app.services.knowledge_store import knowledge_store
from app.services.llm_service import invoke_llm


class KnowledgeAgent(BaseAgent):
    name = "knowledge"
    description = "Answers questions using internal documents."

    def run(self, query: str, context: dict[str, Any]) -> dict[str, Any]:
        fallback = (
            "Invoice reminders should be sent after 7 days overdue. "
            "Escalate to finance manager after 14 days."
        )
        retrieved_answer, sources = knowledge_store.query(query, fallback)
        answer = invoke_llm(
            "Answer the business question using only the provided policy context.",
            f"Question: {query}\n\nContext:\n{retrieved_answer}",
            retrieved_answer,
        )
        return {
            "agent": self.name,
            "action": "document_lookup",
            "query": query,
            "answer": answer,
            "sources": sources or ["collections-policy.md", "support-playbook.md"],
        }
