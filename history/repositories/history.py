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

    async def get_events_aggregated_by_message_id(
        self,
        start_timestamp: int,
        end_timestamp: int,
    ) -> list[Event]:
        """
        Get events within a time range, aggregated by message.id.
        Returns only the latest version of each message in the specified time range.

        Args:
            start_timestamp: Start time as Unix timestamp
            end_timestamp: End time as Unix timestamp

        Returns:
            List of latest events for each unique message.id in the time range
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
            ]

            data = await self.client.aggregate(pipeline).to_list(length=None)
            return data
        except Exception as e:
            raise
