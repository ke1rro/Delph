"""
Repositories for publishing and subscribing to the message queue.
"""

from aiokafka import AIOKafkaConsumer, AIOKafkaProducer
from logger import logger
from pydantic import ValidationError
from repositories.base import Repository

from schemas.message import Message


class QueuePublishRepository(Repository):
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
        self.config = config
        self.producer = AIOKafkaProducer(
            **config,
        )

    async def connect(self):
        """
        Connect repository to the message queue.
        """
        await self.producer.start()
        logger.info(
            "Queue producer connected to topic %s",
            self.topic,
            extra={"config": self.config},
        )

    async def disconnect(self):
        """
        Disconnect repository from the message queue.
        """
        await self.producer.stop()

    async def publish(self, message: Message):
        """
        Publish a message to the message queue.

        Args:
            message: Message to publish.
        """
        await self.producer.send_and_wait(
            self.topic,
            message.model_dump_json().encode(),
            timestamp_ms=message.timestamp,
        )


class QueueSubscription(Repository):
    """
    Subscription to the message queue.

    Args:
        topic: Name of the topic to subscribe to.
        config: Configuration for the message queue. Is used when creating Kafka
            consumer instance and should contain the name of the topic to subscribe to.
    """

    def __init__(self, topic: str, config: dict):
        self.topic = topic
        self.config = config
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
        logger.info(
            "Queue consumer connected to topic %s",
            self.topic,
            extra={"config": self.config},
        )

    async def disconnect(self):
        """
        Disconnect repository from the message queue.
        """
        await self.consumer.stop()

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


class QueueSubscribeRepository(Repository):
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

    async def connect(self):
        """
        Connect repository to the message queue.
        """
        logger.info(
            "Queue subscription created for topic %s",
            self.topic,
            extra={"config": self.config},
        )

    async def disconnect(self):
        """
        Disconnect repository from the message queue.
        """

    def subscribe(self):
        """
        Subscribe to the message queue.
        """
        return QueueSubscription(self.topic, self.config)
