"""
Services for publishing and subscribing to the message queue.
"""

import time
import uuid
from typing import AsyncGenerator

from models.user import User
from repositories.queue import QueuePublishRepository, QueueSubscribeRepository
from services.user import UserService
from shapely import Point

from schemas.message import Entity, Location, Message, Velocity


class NoPermissionError(Exception):
    """
    User has no permission to publish messages at the specified location.
    """


class QueuePublishService:
    """
    Service to publish messages to the message queue.

    Args:
        repo: Queue publish repository.
        user_service: User service.
    """

    def __init__(self, repo: QueuePublishRepository, user_service: UserService):
        self.repo = repo
        self.user_service = user_service

    async def generate_message_id(self) -> str:
        """
        Generate a unique message ID.

        Returns:
            Unique message ID.
        """
        return uuid.uuid4().hex

    async def publish(
        self,
        user: User,
        entity: Entity,
        location: Location,
        velocity: Velocity | None,
        message_id: str | None = None,
        comment: str | None = None,
    ) -> Message:
        """
        Publish a message to the queue with the given parameters.

        Args:
            user: User object.
            entity: The entity to be published.
            location: The location of the entity.
            velocity: The velocity of the entity, if available.
            message_id: The ID of the message. If not provided, a new ID will
                be generated.
            comment: An optional comment to include with the message. Defaults to None.

        Returns:
            The published message.

        Raises:
            NoPermissionError: If the user does not have permission to write to the
                specified location.
        """
        # TODO: Previous message_id/location mismatch
        if not await self.user_service.check_can_write(
            user, Point(location.latitude, location.longitude)
        ):
            raise NoPermissionError

        if message_id is None:
            message_id = await self.generate_message_id()

        message = Message(
            id=message_id,
            timestamp=int(time.time() * 1000),
            source=await self.user_service.create_source(user, comment),
            location=location,
            velocity=velocity,
            entity=entity,
        )

        await self.repo.publish(message)

        return message


class QueueSubscribeService:
    """
    Service to subscribe to the message queue.

    Args:
        repo: Queue subscribe repository.
        user_service: User service.
    """

    def __init__(self, repo: QueueSubscribeRepository, user_service: UserService):
        self.repo = repo
        self.user_service = user_service

    async def subscribe(self, user: User) -> AsyncGenerator[Message, None]:
        """
        Yield messages from the queue that the user can read.

        Args:
            user: User object.

        Yields:
            Message that the user can read.
        """
        async with self.repo.subscribe() as subscription:
            async for message in subscription:
                if await self.user_service.check_can_read(
                    user, Point(message.location.latitude, message.location.longitude)
                ):
                    yield message
