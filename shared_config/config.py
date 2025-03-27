"""
Shared config for the project.
"""

from pathlib import Path
from typing import ClassVar

from pydantic_settings import BaseSettings

BASE_DIR = Path(__file__).parent.parent


class AuthJWT(BaseSettings):
    """
    Class with the path to public and private key for JWT tokens.
    To generate the certificates check the documentation
    """

    private_key_path: Path = BASE_DIR / "certificates" / "jwt-private.pem"
    public_key_path: Path = BASE_DIR / "certificates" / "jwt-public.pem"
    algorithm: str = "RS256"
    access_token_expire: int = 20


class Redis(BaseSettings):
    """
    Base setting for Redis
    """

    redis_host: str
    redis_port: int
    redis_db: int
    redis_password: str

    @property
    def redis_url(self) -> str:
        """
        Return the Redis URL for connection.
        """
        return f"redis://:{self.redis_password}@{self.redis_host}:{self.redis_port}/{self.redis_db}"


class Settings(BaseSettings):
    """
    Class to store the project configuration instances.
    """

    auth_jwt: ClassVar[AuthJWT] = AuthJWT()
    redis: ClassVar[Redis] = Redis()


settings = Settings()
