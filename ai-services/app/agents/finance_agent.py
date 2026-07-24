from typing import Any

from app.agents.base import BaseAgent


class FinanceAgent(BaseAgent):
    name = "finance"
    description = "Handles invoices and payment follow-ups."

    def run(self, query: str, context: dict[str, Any]) -> dict[str, Any]:
        overdue = context.get("overdue_invoices", [])
        reminders = [
            {
                "invoice_number": invoice.get("invoiceNumber") or invoice.get("invoice_number"),
                "customer_email": invoice.get("customerEmail") or invoice.get("customer_email"),
                "subject": "Payment reminder",
                "body": (
                    "Hello, this is a friendly reminder that your invoice is overdue. "
                    "Please let us know if you need a copy resent."
                ),
            }
            for invoice in overdue
        ]
        return {
            "agent": self.name,
            "action": "draft_invoice_reminders",
            "overdue_count": len(overdue),
            "reminder_emails": reminders,
        }
