from langchain_openai import ChatOpenAI

from app.config import settings


def get_chat_model() -> ChatOpenAI | None:
    if not settings.llm_enabled():
        return None
    return ChatOpenAI(
        api_key=settings.openai_api_key,
        model=settings.openai_model,
        temperature=0.2,
    )


def invoke_llm(system_prompt: str, user_prompt: str, fallback: str) -> str:
    model = get_chat_model()
    if model is None:
        return fallback

    try:
        response = model.invoke(
            [
                {"role": "system", "content": system_prompt},
                {"role": "user", "content": user_prompt},
            ]
        )
        content = response.content
        if isinstance(content, str) and content.strip():
            return content.strip()
    except Exception:
        pass
    return fallback
