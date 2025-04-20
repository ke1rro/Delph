"""
Streaming service to stream messages from Kafka to the client.
"""

import asyncio

from config import settings
from fastapi import APIRouter, Depends
from fastapi.websockets import WebSocket, WebSocketState
from logger import logger
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
    logger.info("WebSocket sender established for user ID %s", user.id)

    try:
        async for message in queue_service.subscribe(user):
            await websocket.send_json(message.model_dump())
    except asyncio.CancelledError:
        pass
    except Exception as e:
        logger.exception("Error while sending message to user ID %s", user.id)
        await websocket.close(code=1011)
        raise e
    finally:
        logger.info("WebSocket sender closed for user ID %s", user.id)


async def websocket_receive(
    websocket: WebSocket,
    user: User,
):
    """
    Receive messages from the client.

    Args:
        websocket: WebSocket object.
    """
    logger.info("WebSocket receiver established for user ID %s", user.id)
    try:
        async for _ in websocket.iter_text():
            pass
    except asyncio.CancelledError:
        pass
    except Exception as e:
        logger.exception("Error while receiving message from user ID %s", user.id)
        await websocket.close(code=1011)
        raise e
    finally:
        logger.info("WebSocket receiver closed for user ID %s", user.id)


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
    logger.info("WebSocket connection accepted for user ID %s", user.id)

    task_send = asyncio.create_task(websocket_send(websocket, user, queue_service))
    task_receive = asyncio.create_task(websocket_receive(websocket, user))
    try:
        while websocket.state != WebSocketState.DISCONNECTED:
            if not await user_service.validate_user(user):
                logger.warning(
                    "User ID %s websocket was blocked due to expiration of token %s",
                    user.id,
                    user.token,
                )

                task_send.cancel()
                task_receive.cancel()

                await websocket.close(code=3000)
                return

            await asyncio.sleep(settings.websocket_user_validation_interval)
    finally:
        task_send.cancel()
        task_receive.cancel()
        logger.info("WebSocket connection closed for user ID %s", user.id)
