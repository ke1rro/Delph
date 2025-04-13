"""
Adapter main module.
"""

import asyncio
import logging
from contextlib import asynccontextmanager
from typing import AsyncGenerator

from api.dependencies import with_history_repository
from config import settings
from repositories.queue import QueueSubscription
from services.adapter import AdapterService

logger = logging.getLogger("delta")


@asynccontextmanager
async def with_queue_repository() -> AsyncGenerator[QueueSubscription, None]:
    """
    Create a new instance of the QueueSubscription.

    Yields:
        QueueSubscription: A new instance of the QueueSubscription.
    """
    async with QueueSubscription(
        settings.kafka_topic,
        {
            "bootstrap_servers": settings.kafka_bootstrap_servers,
            "group_id": settings.kafka_group_id,
        },
    ) as queue_subscription:
        yield queue_subscription


async def main():
    """
    Main function to run the adapter service.
    """
    async with (
        with_history_repository() as history_repository,
        with_queue_repository() as queue_repository,
    ):
        service = AdapterService(queue_repository, history_repository)
        logger.info("Adapter service started")
        await service.process()


if __name__ == "__main__":
    asyncio.run(main())
