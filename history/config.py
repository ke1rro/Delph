"""
Contains the configuration settings for the history service.
"""

from pydantic_settings import BaseSettings


class Settings(BaseSettings):
    """
    Settings for the history service.
    """

    kafka_topic: str = "delta"
    kafka_bootstrap_servers: str = "localhost:9092"
    kafka_group_id: str = "history"
    mongodb_url: str
    mongodb_database: str
    mongodb_collection: str


settings = Settings()
