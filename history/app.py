"""
History data  service entry point.
"""

import asyncio

from fastapi import FastAPI

from core.test import add_data_example, select_all

app = FastAPI(root_path="/api/history")


@app.get("/history")
async def get_history():
    """
    Get history data.
    """

    # Added example to add data into Mongo
    await add_data_example()

    return await select_all()