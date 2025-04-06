"""
Query and manage the history to mongoDB.
"""

from core.mongodb import MongoDB, mongo


class MongoRepository:
    """MongoDB repository class, which contains methods for data manipulation."""

    def __init__(self, mongodb: MongoDB = mongo, collection: str = "my_collection"):
        self.collection = mongodb.db[collection]

    async def find_to_list(self, filters: dict = {}, return_fields: dict = {}) -> list:
        """
        Reads from the collection with given mongo filters
        """
        return await self.collection.find(filters, return_fields).to_list()

    async def insert_one(self, doc: dict):
        """
        Inserts one document into collection.
        """
        await self.collection.insert_one(doc)

    async def insert_many(self, docs: list[dict]):
        """
        Inserts list of documents into collection.
        """
        await self.collection.insert_many(docs)
