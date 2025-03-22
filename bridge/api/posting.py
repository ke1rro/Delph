"""
Posting service to send messages to the message broker.
"""

from fastapi import APIRouter, Depends, Header, HTTPException
from pydantic import BaseModel, Field
from services.queue import NoPermissionError, QueuePublishService
from services.user import AuthenticationError, UserService

from api.dependencies import get_queue_publish_service, get_user_service
from schemas.message import Entity, Location, Message, Velocity

router = APIRouter(tags=["posting"])


@router.put("/messages")
async def create_message(
    entity: Entity,
    location: Location,
    velocity: Velocity | None,
    message_id: str | None = None,
    comment: str | None = None,
    token: str = Header(alias="Authorization"),
    user_service: UserService = Depends(get_user_service),
    queue_service: QueuePublishService = Depends(get_queue_publish_service),
) -> str:
    """
    Send a message to the message broker.

    Args:
        entity: The entity to be published.
        location: The location of the entity.
        velocity: The velocity of the entity. Defaults to None.
        message_id: Unique message ID. Defaults to None.
        comment: Comment for the message. Defaults to None.
        token: User token.
        user_service: User service dependency.
        queue_service: Queue publish service dependency.

    Returns:
        Unique message ID.
    """

    # TODO: JWT authentication
    try:
        user = await user_service.authenticate(token)
    except AuthenticationError as e:
        raise HTTPException(status_code=403, detail="Invalid token") from e

    try:
        return (
            await queue_service.publish(
                user, entity, location, velocity, message_id, comment
            )
        ).id
    except NoPermissionError as e:
        raise HTTPException(status_code=403, detail="Location is forbidden") from e
