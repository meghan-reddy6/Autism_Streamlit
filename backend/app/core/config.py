from pydantic_settings import BaseSettings

class Settings(BaseSettings):
    PROJECT_NAME: str = "Autism Assessment API"
    DATABASE_URL: str = "sqlite+aiosqlite:///./autism.db"
    
    class Config:
        env_file = ".env"

settings = Settings()
