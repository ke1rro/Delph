"""
History data  service entry point.
"""

import asyncio

from core.test import add_data_example, select_all
from fastapi import FastAPI
from services.history_service import MongoHistoryService

app = FastAPI(root_path="/api/history")


@app.get("/history")
async def get_history():
    """
    Get history data.
    """

    # Added example to add data into Mongo
    await add_data_example()

    return await select_all()


@app.get("/history/{id}")
async def get_history_by_id(id: str):
    """
    Get history data.
    """
    db = MongoHistoryService()
    data = await db.get_by_id(id)
    print("Data by ID selected!")
    return data
