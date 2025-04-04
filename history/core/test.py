from core.mongodb import mongo
from repositories.history_repository import MongoRepository


async def add_data_example():
    db = MongoRepository(mongo)
    await db.insert_one({"key": "value", "timestamp": "2025-04-02"})
    print("Data inserted!")


async def select_all():
    db = MongoRepository(mongo)
    data = await db.find_to_list({})
    print("Data selected!")
    return data
