from langchain_google_genai import ChatGoogleGenerativeAI

from app.config import settings


def get_chat_model() -> ChatGoogleGenerativeAI | None:
    if not settings.llm_enabled():
        return None
    return ChatGoogleGenerativeAI(
        google_api_key=settings.gemini_api_key,
        model=settings.gemini_model,
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
