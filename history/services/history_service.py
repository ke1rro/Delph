"""
Bussiness logic here
"""

from bson.objectid import ObjectId
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
