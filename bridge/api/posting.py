"""
Posting service to send messages to the message broker.
"""

from fastapi import APIRouter, Depends, HTTPException, Request
from logger import logger
from models.user import User
from pydantic import BaseModel, Field
from services.queue import NoPermissionError, QueuePublishService
from services.user import UserService
from starlette.authentication import requires

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
        le=7 * 24 * 60 * 60 * 1000,
    )
    message_id: str | None = None
    comment: str | None = Field(
        default=None,
        max_length=256,
    )


@router.put("/messages")
@requires("authenticated")
async def create_message(
    request: Request,
    body: CreateMessage,
    user_service: UserService = Depends(get_user_service),
    queue_service: QueuePublishService = Depends(get_queue_publish_service),
) -> Message:
    """
    Create a new message and enqueue it.
    """
    user = User(
        id=request.user.user_id,
        name=request.user.username,
        token=request.user.token,
        permissions=[await user_service.get_global_permission()],
    )

    try:
        return await queue_service.publish(
            user,
            body.entity,
            body.location,
            body.velocity,
            body.ttl,
            body.message_id,
            body.comment,
        )
    except NoPermissionError as e:
        logger.exception(
            "User with ID %s does not have permission to publish to location %s",
            user.id,
            body.location,
        )
        raise HTTPException(status_code=403, detail="Location is forbidden") from e
