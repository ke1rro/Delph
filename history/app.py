"""
History data  service entry point.
"""

import asyncio

import pymongo
import pymongo.errors
from fastapi import FastAPI
from pydantic import BaseModel, Field
from schemas.message import Entity, Location, Message, Velocity

from core.test import add_data_example, select_all
from services.history_service import MongoHistoryService, MongoMessageService

app = FastAPI(root_path="/api/history")


class CreateMessage(BaseModel):
    """
    Create message request schema.
    """

    entity: Entity
    location: Location
    velocity: Velocity | None = None
    ttl: int | None = Field(
        default=None,
        ge=0,
        le=7 * 24 * 60 * 60 * 1000,
    )
    message_id: str | None = None
    comment: str | None = Field(
        default=None,
        max_length=256,
    )


@app.get("/history")
async def get_data():
    """
    Get history data.
    """

    return await select_all()


@app.post("/history")
async def post_data():
    """
    Get history data.
    """
    await add_data_example()

    return await select_all()


@app.get("/history/{id}")
async def get_data_by_id(id: str):
    """
    Get history data.
    """
    db = MongoHistoryService()
    data = await db.get_by_id(id)
    print("Data by ID selected!")
    return data


@app.get("/history/msg")
async def get_messages():
    """
    Get history data.
    """
    db = MongoMessageService()

    return await db.get_all()


@app.post("/history/msg")
async def post_message(message: CreateMessage):
    db = MongoMessageService()

    try:
        msg = await db.insert_one(
            message.entity,
            message.location,
            message.velocity,
            message.ttl,
            message.message_id,
            message.comment,
        )
    except pymongo.errors.DuplicateKeyError:
        return {"error": "Duplicate Key"}
    return msg
