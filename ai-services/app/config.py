from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    openai_api_key: str = ""
    openai_model: str = "gpt-4o-mini"
    backend_url: str = "http://localhost:8080"
    chroma_persist_dir: str = "./data/chroma"

    model_config = SettingsConfigDict(env_file=".env", extra="ignore")


settings = Settings()
