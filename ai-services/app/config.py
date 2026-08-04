from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    openai_api_key: str = ""
    openai_model: str = "gpt-4o-mini"
    backend_url: str = "http://localhost:8080"
    chroma_persist_dir: str = "./data/chroma"
    internal_api_key: str = "internal-dev-api-key-change-in-production"

    model_config = SettingsConfigDict(env_file=".env", extra="ignore")

    def llm_enabled(self) -> bool:
        return bool(self.openai_api_key.strip())


settings = Settings()
