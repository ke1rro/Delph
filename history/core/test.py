from services.history_service import MongoHistoryService


async def add_data_example():
    db = MongoHistoryService()
    await db.insert_one({"key": "value", "timestamp": "2025-04-02"})
    print("Data inserted!")

    await db.insert_many(
        [
            {"key": "value4", "timestamp": "2025-04-04"},
            {"key": "value3", "timestamp": "2025-04-03"},
            {"key": "value2", "timestamp": "2025-04-02"},
            {"key": "value1", "timestamp": "2025-04-01"},
        ]
    )
    print("Many Data inserted!")


async def select_all():
    db = MongoHistoryService()
    data = await db.get_all()
    print("Data selected!")
    return data
