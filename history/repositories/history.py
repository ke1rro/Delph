"""
User repository to interact with the database.
"""

from motor.motor_asyncio import AsyncIOMotorCollection

from models.event import Event


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

    async def get_active_events(self, timestamp: int) -> Event | None:
        """
        Get an active event (that is created but not outdated) by message ID and timestamp.

        Args:
            message_id: ID of the message.
            timestamp: Timestamp to check against.

        Returns:
            Event object if found, None otherwise.
        """
        data = await self.client.find(
            {
                "created_at": {
                    "$lte": timestamp,
                },
                "outdated_at": {
                    "$gte": timestamp,
                },
            }
        ).to_list()
        # Convert each dictionary to Event model
        return [Event.model_validate(d) for d in data]
