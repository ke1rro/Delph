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
    mongo_host: str
    mongo_port: str

    @property
    def mongo_uri(self) -> str:
        """
        Generate the MongoDB connection URI.
        """
        return (
            f"mongodb://{self.mongo_root_user}:{self.mongo_root_password}@"
            f"{self.mongo_host}:{self.mongo_port}/{self.mongo_db_name}?authSource=admin"
        )


class Settings(BaseSettings):
    """
    Class to store the project configuration instances.
    """

    mongodb: ClassVar[MongoDB] = MongoDB()
    kafka_topic: str = "delta"
    KAFKA_HISTORY_BOOTSTRAP_SERVERS: str = "kafka:9092"
    KAFKA_GROUP_ID: str = "history-group"


settings = Settings()
