from pydantic_settings import BaseSettings
from typing import List



class Settings(BaseSettings):
    SQLALCHEMY_DATABASE_URI: str = "mysql://root:199622@localhost:3306/sistema_ventas"
    API_V1_STR: str = "/api"
    PROJECT_NAME: str = "Sistema de Ventas"
    CORS_ORIGINS: List[str] = ["http://localhost:5173"]  # frontend de Vite

    class Config:
        case_sensitive = True

settings = Settings()

