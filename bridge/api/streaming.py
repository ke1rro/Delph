"""
Streaming service to stream messages from Kafka to the client.
"""

from fastapi import (
    APIRouter,
    Depends,
    Header,
    HTTPException,
    WebSocket,
    WebSocketDisconnect,
)

from api.dependencies import get_queue_subscribe_service, get_user_service
from services.queue import QueueSubscribeService
from services.user import AuthenticationError, UserService

router = APIRouter()


@router.websocket("/readMessages")
async def websocket_endpoint(
    websocket: WebSocket,
    token: str = Header(alias="Authorization"),
    user_service: UserService = Depends(get_user_service),
    queue_service: QueueSubscribeService = Depends(get_queue_subscribe_service),
):
    """
    WebSocket endpoint that streams messages from Kafka to the client.

    Args:
        websocket: WebSocket object.
        token: User token.
        user_service: User service dependency.
        queue_service: Queue subscribe service dependency
    """
    # TODO: JWT authentication
    try:
        user = await user_service.authenticate(token)
    except AuthenticationError as e:
        raise HTTPException(status_code=403, detail="Invalid token") from e

    await websocket.accept()

    # TODO: Handle disconnection while no messages are being sent
    try:
        async for message in queue_service.subscribe(user):
            await websocket.send_json(message.model_dump())
    except WebSocketDisconnect:
        pass
