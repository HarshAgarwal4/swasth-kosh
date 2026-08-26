import os
from pydantic_settings import BaseSettings

class Settings(BaseSettings):
    app_name: str = "Silicosis AI Screening Microservice"
    app_version: str = "1.0.0"
    ai_port: int = int(os.getenv("AI_PORT", "8000"))
    ai_host: str = os.getenv("AI_HOST", "0.0.0.0")
    ai_service_key: str = os.getenv("AI_SERVICE_KEY", "silicosis_ai_secret_key_2026")
    llm_provider: str = os.getenv("LLM_PROVIDER", "gemini")
    gemini_api_key: str = os.getenv("GEMINI_API_KEY", "")
    openai_api_key: str = os.getenv("OPENAI_API_KEY", "")

    class Config:
        env_file = ".env"
        extra = "ignore"

settings = Settings()
