"""
Contains the configuration settings for the bridge service.
"""

from pydantic_settings import BaseSettings


class Settings(BaseSettings):
    """
    Settings for the bridge service.
    """

    jwt_public_key: str
    jwt_algorithm: str = "RS256"
    user_source_fmt: str = "DELTA_USER/{user_id}"
    kafka_topic: str = "delta"
    kafka_bootstrap_servers: str = "localhost:9092"
    kafka_linger_ms: int = 0
    kafka_max_batch_size: int = 16384


settings = Settings()
