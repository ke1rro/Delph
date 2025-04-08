"""
Bussiness logic here
"""

import time
import uuid

from bson.objectid import ObjectId
from schemas.message import Entity, Location, Message, Source, Velocity

from repositories.history_repository import MongoRepository


class MongoHistoryService:
    def __init__(self, repo: MongoRepository = None, collection: str = "history"):
        if repo is None:
            repo = MongoRepository(collection=collection)
        self.repo = repo

    async def get_all(self) -> list:
        """
        Gets all data. Deletes ID
        """
        data = await self.repo.find_to_list()
        for i in range(len(data)):
            data[i]["_id"] = str(data[i]["_id"])
        return data

    async def get_by_id(self, id: str) -> list:
        id = ObjectId(id)
        data = await self.repo.find_to_list({"_id": id})
        for i in range(len(data)):
            data[i]["_id"] = str(data[i]["_id"])
        return data

    async def insert_one(self, doc: dict):
        """
        Inserts one document into collection.
        """
        return await self.repo.insert_one(doc)

    async def insert_many(self, docs: list[dict]):
        """
        Inserts one document into collection.
        """
        return await self.repo.insert_many(docs)


class MongoMessageService:
    """
    Service woring with Messages and Mongo
    """

    def __init__(
        self, repo: MongoRepository = None, collection: str = "history_messages"
    ):
        if repo is None:
            repo = MongoRepository(collection=collection)
        self.repo = repo
        self.repo.collection.create_index("id", unique=True)

    async def get_all(self) -> list:
        """
        Gets all data. Deletes ID
        """
        data = await self.repo.find_to_list()
        for i in range(len(data)):
            data[i]["_id"] = str(data[i]["_id"])
        return data

    async def insert_one(
        self,
        entity: Entity,
        location: Location,
        velocity: Velocity | None = None,
        ttl: int | None = None,
        message_id: str | None = None,
        comment: str | None = None,
    ) -> dict:
        """
        Inserts one document into collection.
        """
        data = await self.process_message(
            entity, location, velocity, ttl, message_id, comment
        )
        await self.repo.insert_one(data.model_dump())
        return data

    async def process_message(
        self,
        entity: Entity,
        location: Location,
        velocity: Velocity | None = None,
        ttl: int | None = None,
        message_id: str | None = None,
        comment: str | None = None,
    ) -> Message:
        """
        Processes message input managing empty fields and changing the name of id field to _id
        """
        if message_id is None:
            message_id = await self.generate_message_id()

        if ttl is None:
            ttl = 7 * 24 * 60 * 60 * 1000

        message = Message(
            id=message_id,
            timestamp=int(time.time() * 1000),
            ttl=ttl,
            source=Source(
                id=message_id, name="yagodanr", comment=comment
            ),  # source=await self.user_service.create_source(user, comment),
            location=location,
            velocity=velocity,
            entity=entity,
        )

        return message

    async def generate_message_id(self) -> str:
        """
        Generate a unique message ID.

        Returns:
            Unique message ID.
        """
        return uuid.uuid4().hex
