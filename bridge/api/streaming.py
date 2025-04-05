"""
Streaming service to stream messages from Kafka to the client.
"""

import asyncio

from config import settings
from fastapi import APIRouter, Depends
from fastapi.websockets import WebSocket, WebSocketState
from models.user import User
from services.queue import QueueSubscribeService
from services.user import UserService
from starlette.authentication import requires

from api.dependencies import get_queue_subscribe_service, get_user_service

router = APIRouter()


async def websocket_send(
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


async def websocket_receive(
    websocket: WebSocket,
):
    """
    Receive messages from the client.

    Args:
        websocket: WebSocket object.
    """
    async for _ in websocket.iter_text():
        pass


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
    user = User(
        id=websocket.user.user_id,
        name=websocket.user.username,
        token=websocket.user.token,
        permissions=[await user_service.get_global_permission()],
    )

    await websocket.accept()

    task_send = asyncio.create_task(websocket_send(websocket, user, queue_service))
    task_receive = asyncio.create_task(websocket_receive(websocket))
    try:
        while websocket.state != WebSocketState.DISCONNECTED:
            if not await user_service.validate_user(user):
                task_send.cancel()
                task_receive.cancel()

                await websocket.close(code=3000)
                return

            await asyncio.sleep(settings.websocket_user_validation_interval)
    finally:
        task_send.cancel()
        task_receive.cancel()
