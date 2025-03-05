"""
Config file
"""

from pathlib import Path

from pydantic import BaseModel
from pydantic_settings import BaseSettings
from typing import ClassVar

BASE_DIR = Path(__file__).parent.parent


class AuthJWT(BaseModel):
    """
    Class with the path to public and private key for JWT tokens.
    To generate the certificates check the documentation
    """

    private_key_path: Path = BASE_DIR / "certificates" / "jwt-private.pem"
    public_key_path: Path = BASE_DIR / "certificates" / "jwt-public.pem"
    algorithm: str = "RS256"
    access_token_expire: int = 3


class Settings(BaseSettings):
    """
    Class to store the project configuration instances.
    """

    auth_jwt: ClassVar[AuthJWT] = AuthJWT()


settings = Settings()
