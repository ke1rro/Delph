"""
Repository for subscribing to Kafka and storing data in MongoDB.
"""

import logging
from typing import Any, Dict

from aiokafka import AIOKafkaConsumer
from pydantic import ValidationError
from schemas.message import Message

from adapter.base import Repository
from repositories.history_repository import MongoRepository
from services.history_service import MongoHistoryService

logger = logging.getLogger("delta")


class KafkaToMongoRepository(Repository):
    """
    Repository to subscribe to Kafka messages and store them in MongoDB.

    Args:
        topic: Name of the topic to subscribe to.
        kafka_config: Configuration for the Kafka consumer.
        mongo_collection: MongoDB collection name for storing data.
    """

    def __init__(
        self, topic: str, kafka_config: dict, mongo_collection: str = "history"
    ):
        self.topic = topic
        self.kafka_config = kafka_config
        self.consumer = None
        self.mongo_service = MongoHistoryService(
            repo=MongoRepository(collection=mongo_collection)
        )

    async def connect(self):
        """
        Connect repository to the Kafka message queue.
        """
        self.consumer = AIOKafkaConsumer(
            self.topic,
            **self.kafka_config,
            auto_offset_reset="earliest",
        )
        await self.consumer.start()
        logger.info(f"Kafka consumer connected to topic {self.topic}")

    async def disconnect(self):
        """
        Disconnect repository from the Kafka message queue.
        """
        if self.consumer:
            await self.consumer.stop()
            logger.info("Kafka consumer disconnected")

    async def process_messages(self):
        """
        Continuously process messages from Kafka and store them in MongoDB.
        """
        if not self.consumer:
            raise RuntimeError("Consumer not connected. Call connect() first.")

        async for kafka_msg in self.consumer:
            try:
                message = Message.model_validate_json(kafka_msg.value)

                mongo_doc = self.transform_message_to_document(message)

                await self.mongo_service.insert_one(mongo_doc)

                logger.info(
                    f"Successfully processed and stored message with timestamp: {message.timestamp}"
                )

            except ValidationError:
                logger.exception(
                    "Failed to decode message body",
                    extra={"data": str(kafka_msg.value)},
                )
            except Exception as e:
                logger.exception(
                    f"Error processing message: {str(e)}",
                    extra={"data": str(kafka_msg.value)},
                )

    def _transform_message_to_document(self, message: Message) -> Dict[str, Any]:
        """
        Transform a Message object into a MongoDB document.

        Args:
            message: Validated Message object

        Returns:
            Dictionary representing the MongoDB document
        """
        doc = message.model_dump()
        return doc
