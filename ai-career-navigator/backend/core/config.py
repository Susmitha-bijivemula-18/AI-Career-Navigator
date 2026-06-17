# backend/core/config.py - Application configuration and settings loading using pydantic-settings
from pydantic_settings import BaseSettings, SettingsConfigDict

class Settings(BaseSettings):
    model_config = SettingsConfigDict(
        env_file=".env", 
        env_file_encoding="utf-8", 
        extra="ignore"
    )
    
    ADZUNA_APP_ID: str = ""
    ADZUNA_API_KEY: str = ""
    JSEARCH_API_KEY: str = ""
    OPENAI_API_KEY: str = ""
    MONGODB_URL: str = "mongodb://localhost:27017"
    DB_NAME: str = "ai_career_navigator"
    REDIS_URL: str = "redis://localhost:6379"
    LOG_LEVEL: str = "INFO"
    FETCH_INTERVAL_MINUTES: int = 30
    JOB_EXPIRY_DAYS: int = 30

settings = Settings()
