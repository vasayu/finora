"""
config.py

Purpose:
--------
Centralized settings loaded from environment variables.
"""

from pydantic_settings import BaseSettings


class Settings(BaseSettings):
    OPENAI_API_KEY: str = ""
    DATABASE_URL: str = "postgresql+psycopg2://user:password@localhost:5432/dbname"
    FAISS_INDEX_PATH: str = "faiss_index"
    BACKEND_BASE_URL: str = "http://backend:5000/api/v1"
    INTERNAL_SECRET: str = "finora-internal-secret"

    class Config:
        env_file = ".env"


settings = Settings()
