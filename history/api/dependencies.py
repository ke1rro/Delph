"""
This module contains the dependencies for the FastAPI application.
"""

from contextlib import asynccontextmanager
from typing import AsyncGenerator

from config import settings
from logger import logger
from motor.motor_asyncio import AsyncIOMotorClient
from repositories.history import HistoryRepository


async def get_history_repository() -> AsyncGenerator[HistoryRepository, None]:
    """
    Create a new instance of the HistoryRepository.

    Yields:
        HistoryRepository: A new instance of the HistoryRepository.
    """
    client = AsyncIOMotorClient(settings.mongodb_url)
    try:
        collection = client[settings.mongodb_database][settings.mongodb_collection]
        logger.info(
            "MongoDB connection established to %s.%s",
            settings.mongodb_database,
            settings.mongodb_collection,
        )
        history_repository = HistoryRepository(collection)
        yield history_repository
    finally:
        client.close()
        logger.info("MongoDB connection closed")


with_history_repository = asynccontextmanager(get_history_repository)
