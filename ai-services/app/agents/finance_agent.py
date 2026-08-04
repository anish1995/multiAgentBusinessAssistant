from typing import Any

from app.agents.base import BaseAgent
from app.services.llm_service import invoke_llm


class FinanceAgent(BaseAgent):
    name = "finance"
    description = "Handles invoices and payment follow-ups."

    def run(self, query: str, context: dict[str, Any]) -> dict[str, Any]:
        overdue = context.get("overdue_invoices", [])
        reminders = []
        for invoice in overdue:
            invoice_number = invoice.get("invoiceNumber") or invoice.get("invoice_number")
            customer_email = invoice.get("customerEmail") or invoice.get("customer_email")
            customer_name = invoice.get("customerName") or invoice.get("customer_name") or "Customer"
            amount = invoice.get("amount")
            fallback_body = (
                f"Hello {customer_name}, this is a reminder that invoice {invoice_number} "
                f"for ${amount} is overdue. Please contact us if you need a copy resent."
            )
            body = invoke_llm(
                "You draft professional payment reminder emails for overdue invoices.",
                f"Draft a reminder for invoice {invoice_number}, customer {customer_name}, amount {amount}.",
                fallback_body,
            )
            reminders.append(
                {
                    "invoice_number": invoice_number,
                    "customer_email": customer_email,
                    "subject": f"Payment reminder for {invoice_number}",
                    "body": body,
                }
            )

        return {
            "agent": self.name,
            "action": "draft_invoice_reminders",
            "overdue_count": len(overdue),
            "reminder_emails": reminders,
        }
