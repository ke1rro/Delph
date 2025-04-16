"""
Adapter main module.
"""

import asyncio
import logging.config
import signal
from contextlib import asynccontextmanager
from functools import partial
from typing import AsyncGenerator

from config import settings
from logger import logger
from repositories.queue import QueueSubscription
from services.adapter import AdapterService

from api.dependencies import with_history_repository

logging.config.fileConfig("/config/logging.ini", disable_existing_loggers=False)


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


def handle_shutdown(event: asyncio.Event) -> None:
    """
    Handle shutdown signals (SIGINT, SIGTERM) to gracefully shut down the service.
    """
    logger.info("Shutdown signal received. Preparing to exit...")
    event.set()


async def main():
    """
    Main function to run the adapter service.
    """
    shutdown_event = asyncio.Event()

    loop = asyncio.get_running_loop()
    for sig in (signal.SIGINT, signal.SIGTERM):
        loop.add_signal_handler(sig, partial(handle_shutdown, shutdown_event))

    logger.info("Adapter service is starting...")

    async with (
        with_history_repository() as history_repository,
        with_queue_repository() as queue_repository,
    ):
        service = AdapterService(queue_repository, history_repository)
        logger.info("Adapter service started")

        service_task = asyncio.create_task(service.process())

        await shutdown_event.wait()
        service_task.cancel()
        try:
            await service_task
        except asyncio.CancelledError:
            logger.info("Adapter task was cancelled.")

    logger.info("Adapter service shut down gracefully.")


if __name__ == "__main__":
    asyncio.run(main())
