"""
This module contains the dependencies for the FastAPI application.
"""

from contextlib import asynccontextmanager

from config import settings
from repositories.queue import QueuePublishRepository, QueueSubscribeRepository
from repositories.user import UserRepository
from services.queue import QueuePublishService, QueueSubscribeService
from services.user import UserService

from auth.redis import redis_client

user_repository = UserRepository(redis_client)
user_service = UserService(
    user_repository,
    settings.user_source_fmt,
)

kafka_config = {
    "bootstrap_servers": settings.kafka_bootstrap_servers,
}

queue_publish_repository = QueuePublishRepository(
    settings.kafka_topic,
    kafka_config
    | {
        "linger_ms": settings.kafka_linger_ms,
        "max_batch_size": settings.kafka_max_batch_size,
    },
)
queue_publish_service = QueuePublishService(queue_publish_repository, user_service)

queue_subscribe_repository = QueueSubscribeRepository(
    settings.kafka_topic,
    kafka_config,
)
queue_subscribe_service = QueueSubscribeService(
    queue_subscribe_repository, user_service
)


async def get_user_service() -> UserService:
    """
    Get the user service instance.

    Returns:
        UserService instance.
    """
    return user_service


async def get_queue_publish_service() -> QueuePublishService:
    """
    Get the queue publish service instance.

    Returns:
        QueuePublishService instance.
    """
    return queue_publish_service


async def get_queue_subscribe_service() -> QueueSubscribeService:
    """
    Get the queue subscribe service instance.

    Returns:
        QueueSubscribeService instance.
    """
    return queue_subscribe_service


@asynccontextmanager
async def dependencies_lifespans(_):
    """
    Manage the dependencies lifespans.
    """
    async with user_repository, queue_publish_repository:
        yield
