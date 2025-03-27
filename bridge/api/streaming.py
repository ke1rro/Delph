"""
Streaming service to stream messages from Kafka to the client.
"""

import asyncio

from fastapi import APIRouter, Depends, Header, HTTPException, Request, WebSocket
from models.user import User
from services.queue import QueueSubscribeService
from services.user import AuthenticationError, UserService
from starlette.authentication import requires

from api.dependencies import get_queue_subscribe_service, get_user_service

router = APIRouter()


async def websocket_consume(
    websocket: WebSocket,
    user: User,
    queue_service: QueueSubscribeService,
):
    """
    Consume messages from Kafka and send them to the client.

    Args:
        websocket: WebSocket object.
        user: User object.
        queue_service: Queue subscribe service.
    """
    async for message in queue_service.subscribe(user):
        await websocket.send_json(message.model_dump())


@router.websocket("/messages")
@requires("authenticated")
async def stream_messages(
    websocket: WebSocket,
    user_service: UserService = Depends(get_user_service),
    queue_service: QueueSubscribeService = Depends(get_queue_subscribe_service),
):
    """
    Stream messages from the queue.
    """
    # TODO: JWT authentication
    token = "valid"
    print("Trying...")
    try:
        user = await user_service.authenticate(token)
    except AuthenticationError as e:
        raise HTTPException(status_code=403, detail="Invalid token") from e

    await websocket.accept()

    task = asyncio.create_task(websocket_consume(websocket, user, queue_service))
    try:
        async for _ in websocket.iter_bytes():
            pass
    finally:
        task.cancel()
