"""
MongoDB connection module for the History service.
"""

from core.config import settings
from motor.motor_asyncio import AsyncIOMotorClient
from pymongo.server_api import ServerApi


class MongoDB:
    """
    MongoDB connection class.
    """

    def __init__(self):
        self.client = AsyncIOMotorClient(
            settings.mongodb.mongo_uri,
            server_api=ServerApi("1"),
        )
        self.db = self.client[settings.mongodb.mongo_db_name]


mongo = MongoDB()
