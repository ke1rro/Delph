"""
Bussiness logic here
"""

from repositories.history_repository import MongoRepository


class MongoHistoryService:
    def __init__(self, repo: MongoRepository = None):
        if repo is None:
            repo = MongoRepository(collection="history")
        self.repo = repo

    async def get_all(self) -> list:
        """
        Gets all data. Deletes ID
        """
        data = await self.repo.find_to_list()
        return data

    async def insert_one(self, doc: dict):
        """
        Inserts one document into collection.
        """
        return await self.repo.insert_one(doc)
