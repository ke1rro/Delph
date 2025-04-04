from services.history_service import MongoHistoryService


async def add_data_example():
    db = MongoHistoryService()
    await db.insert_one({"key": "value", "timestamp": "2025-04-02"})
    print("Data inserted!")


async def select_all():
    db = MongoHistoryService()
    data = await db.get_all()
    print("Data selected!")
    return data
