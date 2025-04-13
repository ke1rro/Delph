"""
Services for publishing and subscribing to the message queue.
"""

import uuid

from schemas.message import Message

from models.event import Event
from repositories.history import HistoryRepository
from repositories.queue import QueueSubscription


class AdapterService:
    """
    Service for processing messages from the queue and saving them to the database.

    Attributes:
        queue_repo: Repository for the message queue.
        history_repo: Repository for the history database.
    """

    queue_repo: QueueSubscription
    history_repo: HistoryRepository

    def __init__(self, queue_repo: QueueSubscription, history_repo: HistoryRepository):
        self.queue_repo = queue_repo
        self.history_repo = history_repo

    async def generate_event_id(self) -> str:
        """
        Generate a unique event ID.

        Returns:
            Unique event ID.
        """
        return uuid.uuid4().hex

    async def process_message(self, message: Message):
        """
        Process a message from the queue and save it to the database.

        Args:
            message: The message to process.
        """
        event = Event(
            id=await self.generate_event_id(),
            message=message,
            created_at=message.timestamp,
            outdated_at=message.ttl + message.timestamp,
        )

        parent = await self.history_repo.get_active_event_by_message_id(
            message.id,
            message.timestamp,
        )
        if parent is None:
            await self.history_repo.save_event(event)
            return

        if parent.message == message:
            return

        event.parent_id = parent.id
        parent.outdated_at = message.timestamp
        parent.child_id = event.id

        await self.history_repo.save_event(parent)
        await self.history_repo.save_event(event)

    async def process(self):
        """
        Process messages from the queue and save them to the database.
        """
        async for message in self.queue_repo:
            await self.process_message(message)
