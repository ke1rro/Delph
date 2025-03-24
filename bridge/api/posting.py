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


class CreateMessage(BaseModel):
    """
    Create message request schema.
    """

    entity: Entity
    location: Location
    velocity: Velocity | None = None
    ttl: int | None = Field(
        default=None,
        ge=0,
        le=7 * 24 * 60 * 60,
    )
    message_id: str | None = None
    comment: str | None = Field(
        default=None,
        max_length=256,
    )


@router.put("/messages")
async def create_message(
    create_message: CreateMessage,
    token: str = Header(alias="Authorization"),
    user_service: UserService = Depends(get_user_service),
    queue_service: QueuePublishService = Depends(get_queue_publish_service),
) -> Message:
    """
    Create a new message and enqueue it.
    """

    # TODO: JWT authentication
    try:
        user = await user_service.authenticate(token)
    except AuthenticationError as e:
        raise HTTPException(status_code=403, detail="Invalid token") from e

    try:
        return await queue_service.publish(
            user,
            create_message.entity,
            create_message.location,
            create_message.velocity,
            create_message.ttl,
            create_message.message_id,
            create_message.comment,
        )
    except NoPermissionError as e:
        raise HTTPException(status_code=403, detail="Location is forbidden") from e
