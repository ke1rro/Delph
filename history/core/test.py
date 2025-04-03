from core.mongodb import mongo


async def add_data_example():
    await mongo.client["test"]["my_collection"].insert_one(
        {"key": "value", "timestamp": "2025-04-02"}
    )
    print("Data inserted!")
