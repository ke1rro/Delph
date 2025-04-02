"""
Config file
"""

from pathlib import Path
from typing import ClassVar

from pydantic_settings import BaseSettings

BASE_DIR = Path(__file__).parent.parent


class MongoDB(BaseSettings):
    """
    Configuration for MongoDB.
    """

    mongo_root_user: str
    mongo_root_password: str
    mongo_db_name: str

    @property
    def mongo_uri(self) -> str:
        """
        Generate the MongoDB connection URI.
        """
        return (
            f"mongodb://{self.mongo_root_user}:{self.mongo_root_password}@"
            f"localhost:27017/{self.mongo_db_name}"
        )


class Settings(BaseSettings):
    """
    Class to store the project configuration instances.
    """

    mongodb: ClassVar[MongoDB] = MongoDB()


settings = Settings()
