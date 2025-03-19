"""
Config file
"""

from pathlib import Path
from typing import ClassVar

from pydantic import BaseModel
from pydantic_settings import BaseSettings, SettingsConfigDict

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

    model_config = SettingsConfigDict(env_file=f"{BASE_DIR}/.env")

    @property
    def postgres_url(self) -> str:
        """
        Return the postgres url
        """
        return f"postgresql+asyncpg://{self.postgres_user}:{self.postgres_password}@{self.postgres_host}:{self.postgres_port}/{self.postgres_db}"


class AuthJWT(BaseModel):
    """
    Class with the path to public and private key for JWT tokens.
    To generate the certificates check the documentation
    """

    private_key_path: Path = BASE_DIR / "certificates" / "jwt-private.pem"
    public_key_path: Path = BASE_DIR / "certificates" / "jwt-public.pem"
    algorithm: str = "RS256"
    access_token_expire: int = 900


class Settings(BaseSettings):
    """
    Class to store the project configuration instances.
    """

    auth_jwt: ClassVar[AuthJWT] = AuthJWT()
    database: ClassVar[Database] = Database()


settings = Settings()
