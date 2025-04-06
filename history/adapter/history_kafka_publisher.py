import logging

from aiokafka import AIOKafkaProducer
from base import Repository

from schemas.message import Message

logger = logging.getLogger("delta")


class KafkaPublisherRepository(Repository):
    """
    Repository to publish messages to Kafka.
    Args:
        topic: Name of the topic to publish messages to.
        kafka_config: Configuration for the Kafka producer.
    """

    def __init__(self, topic: str, kafka_config: dict):
        self.topic = topic
        self.kafka_config = kafka_config
        self.producer = None

    async def connect(self):
        """
        Connect repository to the Kafka message queue.
        """

        self.producer = AIOKafkaProducer(**self.kafka_config)
        await self.producer.start()
        logger.info(f"Kafka producer connected to topic {self.topic}")

    async def disconnect(self):
        """
        Disconnect repository from the Kafka message queue.
        """
        if self.producer:
            await self.producer.stop()
            logger.info("Kafka producer disconnected")

    async def publish(self, message: Message):
        """
        Publish a message to the Kafka message queue.
        Args:
            message: Message to publish.
        """
        if not self.producer:
            raise RuntimeError("Producer not connected. Call connect() first.")

        logger.debug("Publishing new message: %s", message)
        await self.producer.send_and_wait(
            self.topic,
            message.model_dump_json().encode(),
            timestamp_ms=message.timestamp,
        )
        logger.debug("Message published successfully")
