from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    gemini_api_key: str = ""
    gemini_model: str = "gemini-1.5-flash"
    backend_url: str = "http://localhost:8080"
    chroma_persist_dir: str = "./data/chroma"
    internal_api_key: str = "internal-dev-api-key-change-in-production"

    model_config = SettingsConfigDict(env_file=".env", extra="ignore")

    def llm_enabled(self) -> bool:
        return bool(self.gemini_api_key.strip())


settings = Settings()
