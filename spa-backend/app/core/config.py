from pydantic_settings import BaseSettings


class Settings(BaseSettings):
    APP_NAME: str = "Serenity Spa API"
    APP_VERSION: str = "1.0.0"

    DB_HOST: str = "localhost"
    DB_PORT: int = 3306
    DB_USER: str = "root"
    DB_PASSWORD: str = ""
    DB_NAME: str = "serenity_spa"

    SECRET_KEY: str = "serenity_spa_secret_key"
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 1440

    class Config:
        env_file = ".env"


settings = Settings()