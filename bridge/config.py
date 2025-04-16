"""
Contains the configuration settings for the bridge service.
"""

from pydantic_settings import BaseSettings


class Settings(BaseSettings):
    """
    Settings for the bridge service.
    """

    websocket_user_validation_interval: int = 1
    user_source_fmt: str = "DELPH_USER/{user_id}"
    kafka_topic: str = "delph"
    kafka_bootstrap_servers: str = "localhost:9092"
    kafka_linger_ms: int = 0
    kafka_max_batch_size: int = 16384


settings = Settings()
