import json
from typing import List, Union
from pydantic import field_validator
from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    PROJECT_NAME: str = "Dulce Vicio API"
    DATABASE_URL: str = "sqlite:///./dulce_vicio.db"
    CORS_ORIGINS: Union[str, List[str]] = [
        "http://localhost:5173",
        "http://127.0.0.1:5173",
        "http://localhost:3000",
    ]
    SECRET_KEY: str = "dulce_vicio_super_secret_jwt_key_2026_reposteria_artesanal_segura"
    ALGORITHM: str = "HS256"
    ACCESS_MIN: int = 30
    REFRESH_MIN: int = 10080  # 7 días en minutos

    model_config = SettingsConfigDict(
        env_file=".env",
        env_file_encoding="utf-8",
        case_sensitive=True,
        extra="ignore",
    )

    @property
    def origins(self) -> List[str]:
        """Devuelve los orígenes de CORS formateados como lista de strings."""
        if isinstance(self.CORS_ORIGINS, list):
            return self.CORS_ORIGINS
        if isinstance(self.CORS_ORIGINS, str):
            clean_str = self.CORS_ORIGINS.strip()
            if clean_str.startswith("[") and clean_str.endswith("]"):
                try:
                    return json.loads(clean_str)
                except Exception:
                    pass
            # Si viene delimitado por comas
            return [o.strip() for o in clean_str.split(",") if o.strip()]
        return ["http://localhost:5173", "http://127.0.0.1:5173"]


settings = Settings()
