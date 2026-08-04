import httpx

from app.config import settings


class BackendClient:
    def create_task(self, title: str, description: str | None, assigned_agent: str, status: str = "PENDING") -> bool:
        payload = {
            "title": title,
            "description": description,
            "assignedAgent": assigned_agent,
            "status": status,
        }
        try:
            response = httpx.post(
                f"{settings.backend_url}/api/internal/tasks",
                json=payload,
                headers={"X-Internal-Api-Key": settings.internal_api_key},
                timeout=10.0,
            )
            return response.status_code == 200
        except Exception:
            return False


backend_client = BackendClient()
