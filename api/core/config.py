"""
Config file
"""

from pathlib import Path
from typing import ClassVar

from pydantic_settings import BaseSettings

BASE_DIR = Path(__file__).parent.parent


class Database(BaseSettings):
    """
    Base setting for database
    """

    postgres_host: str
    postgres_port: int
    postgres_db: str
    postgres_user: str
    postgres_password: str

    @property
    def postgres_url(self) -> str:
        """
        Return the postgres url
        """
        return (
            f"postgresql+asyncpg://{self.postgres_user}:{self.postgres_password}@"
            f"{self.postgres_host}:{self.postgres_port}/{self.postgres_db}"
        )


class CORS(BaseSettings):
    """
    Class with the CORS configuration.
    """

    cors_allow_origin: str


class Cookies(BaseSettings):
    """
    Class with the cookies configuration.
    """

    cookie_secure: bool = True
    cookie_httponly: bool = True


class Settings(BaseSettings):
    """
    Class to store the project configuration instances.
    """

    database: ClassVar[Database] = Database()
    cors: ClassVar[CORS] = CORS()
    cookies: ClassVar[Cookies] = Cookies()


settings = Settings()
