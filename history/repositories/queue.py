"""
Repositories for subscribing to the message queue.
"""

import logging

from aiokafka import AIOKafkaConsumer
from pydantic import ValidationError
from schemas.message import Message

from repositories.base import Repository

logger = logging.getLogger("delta")


class QueueSubscription(Repository):
    """
    Subscription to the message queue.

    Args:
        topic: Name of the topic to subscribe to.
        config: Configuration for the message queue. Is used when creating Kafka
            consumer instance and should contain the name of the topic to subscribe to.
    """

    def __init__(self, topic: str, config: dict):
        self.consumer = AIOKafkaConsumer(
            topic,
            **config,
            auto_offset_reset="earliest",
        )

    async def connect(self):
        """
        Connect repository to the message queue.
        """
        await self.consumer.start()
        logger.info("Queue consumer connected")

    async def disconnect(self):
        """
        Disconnect repository from the message queue.
        """
        await self.consumer.stop()
        logger.info("Queue consumer disconnected")

    def __aiter__(self):
        return self

    async def __anext__(self):
        async for message in self.consumer:
            try:
                return Message.model_validate_json(message.value)
            except ValidationError:
                logger.exception(
                    "Failed to decode message body", extra={"data": str(message.value)}
                )
