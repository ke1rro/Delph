"""
History data  service entry point.
"""

import asyncio

import pymongo
import pymongo.errors
import websockets
from fastapi import Depends, FastAPI, WebSocket
from pydantic import BaseModel, Field
from schemas.message import Entity, Location, Message, Velocity

from adapter.history_kafka_consumer import KafkaToMongoRepository
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


"""
Main entry point for the History service.

Initialization Sequence:
1. Load configurations.
2. Initialize MongoDB connection.
3. Start Kafka consumer to process messages.
"""

import asyncio
import logging

from core.config import settings
from repositories.history_repository import MongoRepository

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger("history-service")


async def initialize_kafka_consumer():
    """
    Initialize and start the Kafka consumer.
    """
    kafka_config = {
        "bootstrap_servers": settings.KAFKA_HISTORY_BOOTSTRAP_SERVERS,
        "group_id": settings.KAFKA_GROUP_ID,
    }
    kafka_topic = settings.kafka_topic
    mongo_collection = "history"

    kafka_consumer = KafkaToMongoRepository(
        topic=kafka_topic, kafka_config=kafka_config, mongo_collection=mongo_collection
    )

    try:
        await kafka_consumer.connect()
        logger.info("Kafka consumer initialized successfully.")
        await kafka_consumer.process_messages()
    except Exception as e:
        logger.error(f"Error initializing Kafka consumer: {e}")
    finally:
        await kafka_consumer.disconnect()

    return kafka_consumer


async def initialize_mongo():
    """
    Initialize MongoDB connection.
    """
    try:
        mongo_service = MongoHistoryService(repo=MongoRepository())
        logger.info("MongoDB initialized successfully.")
        return mongo_service
    except Exception as e:
        logger.error(f"Error initializing MongoDB: {e}")
        raise


async def main():
    """
    Main function to initialize configurations and start the application.
    """
    logger.info("Starting History service...")

    logger.info("Configurations loaded successfully.")

    await initialize_mongo()

    await initialize_kafka_consumer()


@app.get("/history/data")
async def get_data():
    """
    Get history data.
    """
    return await select_all()


@app.post("/history/data")
async def post_data():
    """
    Get history data.
    """

    # Added example to add data into Mongo
    await add_data_example()

    return await select_all()


@app.get("/history/data/{id}")
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


# @app.websocket("/history/stream")
# async def stream_history_data(
#     websocket: WebSocket,
#     # kafka_consumer: KafkaToMongoRepository = Depends(initialize_kafka_consumer),
# ):
#     """
#     Stream history data from Kafka to the client via WebSocket.
#     """
#     await websocket.accept()
#     kafka_consumer = await initialize_kafka_consumer()
#     await websocket.close()


# TODO Move it to dependancies
if __name__ == "__main__":
    try:
        asyncio.run(main())
        asyncio.run(initialize_kafka_consumer())
    except KeyboardInterrupt:
        logger.info("History service stopped.")
