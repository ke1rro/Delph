import json
import logging
import os

import logging_config
from config import settings
from confluent_kafka import Consumer
from pymongo import MongoClient

import utils


class ConsumerClass:
    def __init__(self, bootstrap_server, topic, group_id):
        """Initializes the consumer and MongoDB connection."""
        self.bootstrap_server = bootstrap_server
        self.topic = topic
        self.group_id = group_id
        self.consumer = Consumer(
            {
                "bootstrap.servers": bootstrap_server,
                "group.id": self.group_id,
                "auto.offset.reset": "earliest",
            }
        )

        self.mongo_uri = settings.mongodb.mongo_uri
        self.mongo_db_name = settings.mongodb.mongo_db_name
        self.client = MongoClient(self.mongo_uri)
        self.db = self.client[self.mongo_db_name]
        self.collection_name = os.environ.get("MONGO_COLLECTION_NAME", "messages")
        self.collection = self.db[self.collection_name]
        logging.info(
            f"Connected to MongoDB: {self.mongo_db_name}.{self.collection_name}"
        )

    def process_kafka_message(self, msg_kafka):
        """
        Accepts Kafka's message as bytes, turns it into json
        and inserts data into MongoDB.

        Args:
            msg_kafka (bytes): Kafka message as bytes.
        """
        try:
            message_str = msg_kafka.decode("utf-8")
            data = json.loads(message_str)

            if isinstance(data, list):
                self.collection.insert_many(data)
                logging.info(
                    f"Successfully inserted {len(data)} messages into MongoDB."
                )
            else:
                self.collection.insert_one(data)
                logging.info("Successfully inserted one message into MongoDB.")

        except UnicodeDecodeError:
            logging.error("Error: Could not decode bytes to UTF-8 string.")
        except json.JSONDecodeError:
            logging.error("Error: Could not decode JSON string.")
        except Exception as e:
            logging.error(f"Error inserting into MongoDB: {e}")

    def consume_messages(self):
        """Consume Messages from Kafka."""
        self.consumer.subscribe([self.topic])
        logging.info(f"Successfully subscribed to topic: {self.topic}")

        try:
            while True:
                msg = self.consumer.poll(1.0)
                if msg is None:
                    continue
                if msg.error():
                    logging.error(f"Consumer error: {msg.error()}")
                    continue
                byte_message = msg.value()
                self.process_kafka_message(byte_message)
        except KeyboardInterrupt:
            pass
        finally:
            self.consumer.close()
            self.client.close()
            logging.info("Kafka consumer and MongoDB connection closed.")


if __name__ == "__main__":
    utils.load_env()
    logging_config.configure_logging()

    bootstrap_server = os.environ.get("KAFKA_BOOTSTRAP_SERVERS")
    topic = os.environ.get("KAFKA_TOPIC")
    group_id = os.environ.get("KAFKA_GROUP_ID", "my-consumer-group")
    consumer = ConsumerClass(bootstrap_server, topic, group_id)
    consumer.consume_messages()
