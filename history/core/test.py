from repositories.history_repository import MongoRepository
from core.mongodb import mongo


async def add_data_example():
    db = MongoRepository(mongo)
    await db.insert_one(
        {"key": "value", "timestamp": "2025-04-02"}
    )
    print("Data inserted!")

async def select_all():
    db = MongoRepository(mongo)
    data = await db.find_to_list({})
    print("Data selected!")

    for doc in data:
        doc.pop("_id", None)
    return data
