"""
config.py — Central configuration loaded from .env using pydantic-settings.
All service components import settings from here. Never use os.environ directly.
"""

from pydantic_settings import BaseSettings, SettingsConfigDict
from functools import lru_cache


class Settings(BaseSettings):
    model_config = SettingsConfigDict(
        env_file=".env",
        env_file_encoding="utf-8",
        case_sensitive=False,
        extra="ignore",
    )

    # OpenAI
    openai_api_key: str

    # PostgreSQL (same DB as Express backend)
    database_url: str

    # FAISS
    faiss_store_path: str = "./data/faiss"

    # Server
    host: str = "0.0.0.0"
    port: int = 8000


@lru_cache
def get_settings() -> Settings:
    """Cached settings instance — instantiated only once per process."""
    return Settings()
