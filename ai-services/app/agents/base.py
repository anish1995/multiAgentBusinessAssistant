from abc import ABC, abstractmethod
from typing import Any


class BaseAgent(ABC):
    name: str
    description: str

    @abstractmethod
    def run(self, query: str, context: dict[str, Any]) -> dict[str, Any]:
        raise NotImplementedError
