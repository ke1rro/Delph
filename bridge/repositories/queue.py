"""
Repositories for publishing and subscribing to the message queue.
"""

import logging

from aiokafka import AIOKafkaConsumer, AIOKafkaProducer
from pydantic import ValidationError

from schemas.message import Message

logger = logging.getLogger("delta")


class QueuePublishRepository:
    """
    Repository to publish messages to the message queue.

    Args:
        topic: Name of the topic to publish messages to.
        config: Configuration for the message queue. Is used when creating Kafka producer
            instance and should contain the name of the topic to publish
            messages to.
    """

    def __init__(self, topic: str, config: dict):
        self.topic = topic
        self.producer = AIOKafkaProducer(
            **config,
        )

    async def connect(self):
        """
        Connect repository to the message queue.
        """
        await self.producer.start()
        logger.info("Queue producer connected")

    async def disconnect(self):
        """
        Disconnect repository from the message queue.
        """
        await self.producer.stop()
        logger.info("Queue producer disconnected")

    async def publish(self, message: Message):
        """
        Publish a message to the message queue.

        Args:
            message: Message to publish.
        """
        logger.debug("New message: %s", message)
        await self.producer.send_and_wait(
            self.topic,
            message.model_dump_json().encode(),
            timestamp_ms=message.timestamp,
        )


class QueueSubscription:
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

    async def __aenter__(self):
        await self.connect()
        return self

    async def __aexit__(self, *_):
        await self.disconnect()

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


class QueueSubscribeRepository:
    """
    Repository to subscribe to the message queue.

    Args:
        topic: Name of the topic to subscribe to.
        config: Configuration for the message queue. Is used when creating Kafka consumer
            instance and should contain the name of the topic to subscribe to.
    """

    def __init__(self, topic: str, config: dict):
        self.topic = topic
        self.config = config

    def subscribe(self):
        """
        Subscribe to the message queue.
        """
        logger.info("New subscription to the queue")
        return QueueSubscription(self.topic, self.config)
