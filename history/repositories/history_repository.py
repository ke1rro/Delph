"""
Query and manage the history to mongoDB.
"""
from core.mongodb import MongoDB


class MongoRepository():
    def __init__(self, mongo: MongoDB, collection: str="my_collection"):
        self.collection = mongo.db[collection]


    async def find_to_list(self, filters: dict={}) -> list:
        """
        Reads from the collection with given mongo filters
        """
        return await self.collection.find(filters).to_list()

    async def insert_one(self, doc: dict):
        """
        Inserts one document into collection.
        """
        await self.collection.insert_one(doc)