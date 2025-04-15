"""
User repository to interact with the database.
"""

from models.event import Event
from motor.motor_asyncio import AsyncIOMotorCollection


class HistoryRepository:
    """
    History repository to interact with the database.

    Attributes:
        client: MongoDB collection instance.
    """

    client: AsyncIOMotorCollection

    def __init__(self, client: AsyncIOMotorCollection):
        self.client = client

    async def save_event(self, event: Event):
        """
        Save an event to the database.

        Args:
            event: Event object to be saved.
        """
        await self.client.find_one_and_replace(
            filter={"id": event.id},
            replacement=event.model_dump(),
            upsert=True,
        )

    async def get_all_events(self):
        """
        Get all events from the database.
        """

        data = await self.client.find().to_list()
        events = [Event.model_validate(event) for event in data]
        return events

    async def get_event_by_id(self, event_id: str) -> Event | None:
        """
        Get an event by its ID.

        Args:
            event_id: ID of the event.

        Returns:
            Event object if found, None otherwise.
        """
        data = await self.client.find_one({"id": event_id})
        return data and Event.model_validate(data)

    async def get_active_event_by_message_id(
        self, message_id: str, timestamp: int
    ) -> Event | None:
        """
        Get an active event (that is created but not outdated) by message ID and timestamp.

        Args:
            message_id: ID of the message.
            timestamp: Timestamp to check against.

        Returns:
            Event object if found, None otherwise.
        """
        data = await self.client.find_one(
            {
                "message.id": message_id,
                "created_at": {
                    "$lte": timestamp,
                },
                "outdated_at": {
                    "$gte": timestamp,
                },
            }
        )
        return data and Event.model_validate(data)

    async def get_events_aggregated_by_timestamp(
        self,
        start_timestamp: int,
        end_timestamp: int,
    ) -> list[dict]:
        """
        Get only message objects from events within a time range.
        Returns only the message field from the latest version of each message.

        Args:
            start_timestamp: Start time as Unix timestamp
            end_timestamp: End time as Unix timestamp

        Returns:
            List of message objects only
        """
        try:
            pipeline = [
                {
                    "$match": {
                        "$or": [
                            {
                                "$and": [
                                    {"created_at": {"$gte": start_timestamp}},
                                    {"created_at": {"$lte": end_timestamp}},
                                ]
                            },
                            {
                                "$and": [
                                    {"outdated_at": {"$gte": start_timestamp}},
                                    {"outdated_at": {"$lte": end_timestamp}},
                                ]
                            },
                        ]
                    }
                },
                {
                    "$sort": {
                        "created_at": -1,
                        "outdated_at": -1,
                    }
                },
                {"$limit": 1000},
                {
                    "$group": {
                        "_id": "$message.id",
                        "latest_event": {"$first": "$$ROOT"},
                    }
                },
                {"$replaceRoot": {"newRoot": "$latest_event"}},
                {
                    "$project": {
                        "_id": 0,
                        "message": 1
                    }
                }
            ]

            return await self.client.aggregate(pipeline).to_list(length=None)
        except Exception as e:
            raise
