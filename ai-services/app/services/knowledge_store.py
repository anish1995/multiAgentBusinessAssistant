from pathlib import Path

import chromadb
from chromadb.utils.embedding_functions import OpenAIEmbeddingFunction

from app.config import settings

COLLECTION_NAME = "business_knowledge"


class KnowledgeStore:
    def __init__(self) -> None:
        self._client = chromadb.PersistentClient(path=settings.chroma_persist_dir)
        self._collection = None

    def _get_collection(self):
        if self._collection is not None:
            return self._collection

        embedding_function = None
        if settings.llm_enabled():
            embedding_function = OpenAIEmbeddingFunction(
                api_key=settings.openai_api_key,
                model_name="text-embedding-3-small",
            )

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
