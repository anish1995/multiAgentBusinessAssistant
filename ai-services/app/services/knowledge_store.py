from pathlib import Path
from typing import Any

import chromadb
from langchain_google_genai import GoogleGenerativeAIEmbeddings

from app.config import settings

COLLECTION_NAME = "business_knowledge"
# text-embedding-004 was shut down; use a currently supported Gemini embedding model.
EMBEDDING_MODEL = "gemini-embedding-001"


class GeminiEmbeddingFunction:
    """Chroma embedding function backed by Gemini.

    Newer Chroma versions require name/get_config/build_from_config in addition to __call__.
    """

    def __init__(self, api_key: str, model: str = EMBEDDING_MODEL) -> None:
        self._model = model
        self._embeddings = GoogleGenerativeAIEmbeddings(
            google_api_key=api_key,
            model=model,
        )

    def __call__(self, input):
        texts = [input] if isinstance(input, str) else list(input)
        return self._embeddings.embed_documents(texts)

    @staticmethod
    def name() -> str:
        return "gemini-embedding-001"

    def get_config(self) -> dict[str, Any]:
        return {"model": self._model}

    @staticmethod
    def build_from_config(config: dict[str, Any]) -> "GeminiEmbeddingFunction":
        api_key = settings.gemini_api_key
        if not api_key:
            raise ValueError("GEMINI_API_KEY is required to rebuild GeminiEmbeddingFunction")
        return GeminiEmbeddingFunction(
            api_key=api_key,
            model=config.get("model", EMBEDDING_MODEL),
        )


class KnowledgeStore:
    def __init__(self) -> None:
        self._client = chromadb.PersistentClient(path=settings.chroma_persist_dir)
        self._collection = None

    def _get_collection(self):
        if self._collection is not None:
            return self._collection

        embedding_function = None
        if settings.llm_enabled():
            embedding_function = GeminiEmbeddingFunction(settings.gemini_api_key)

        try:
            self._collection = self._client.get_or_create_collection(
                name=COLLECTION_NAME,
                embedding_function=embedding_function,
            )
        except ValueError as exc:
            # Stale collections from earlier deploys may persist a different EF config.
            if "embedding function" not in str(exc).lower():
                raise
            try:
                self._client.delete_collection(COLLECTION_NAME)
            except Exception:
                pass
            self._collection = self._client.get_or_create_collection(
                name=COLLECTION_NAME,
                embedding_function=embedding_function,
            )
        return self._collection

    def ingest_documents(self) -> None:
        documents_dir = Path(__file__).resolve().parent.parent / "documents"
        if not documents_dir.exists():
            return

        collection = self._get_collection()
        if collection.count() > 0:
            return

        documents: list[str] = []
        metadatas: list[dict[str, str]] = []
        ids: list[str] = []

        for file_path in sorted(documents_dir.glob("*.md")):
            content = file_path.read_text(encoding="utf-8").strip()
            if not content:
                continue
            documents.append(content)
            metadatas.append({"source": file_path.name})
            ids.append(file_path.stem)

        if documents:
            collection.add(documents=documents, metadatas=metadatas, ids=ids)

    def query(self, question: str, fallback: str) -> tuple[str, list[str]]:
        collection = self._get_collection()
        if collection.count() == 0:
            self.ingest_documents()

        if collection.count() == 0:
            return fallback, []

        if not settings.llm_enabled():
            for metadata in collection.get().get("metadatas", []):
                if metadata and metadata.get("source"):
                    return fallback, [metadata["source"]]
            return fallback, []

        results = collection.query(query_texts=[question], n_results=2)
        documents = results.get("documents", [[]])[0]
        metadatas = results.get("metadatas", [[]])[0]
        sources = [meta.get("source", "document") for meta in metadatas if meta]
        answer = "\n\n".join(documents).strip() if documents else fallback
        return answer or fallback, sources


knowledge_store = KnowledgeStore()
