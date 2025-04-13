"""
History data service API routers.
"""

from fastapi import APIRouter, Depends
from fastapi.requests import Request
from pydantic import BaseModel, Field
from starlette.authentication import requires

from api.dependencies import get_history_repository
from models.event import Event
from repositories.history import HistoryRepository

router = APIRouter(tags=["test"])


class CreateEvent(BaseModel):
    """
    Create message request schema.
    """

    event: Event


@router.get("/")
@requires(["authenticated"])
async def get_data(
    request: Request, db: HistoryRepository = Depends(get_history_repository)
):
    """
    Get history data.
    """

    return await db.get_all_events()


@router.get("/{id}")
@requires(["authenticated"])
async def get_active_event_by_message_id(
    request: Request, id: str, timestamp: int, db=Depends(get_history_repository)
):
    """
    Get active event by message_id
    """
    return await db.get_active_event_by_message_id(id, timestamp)


@router.get("/active/")
@requires(["authenticated"])
async def get_active_events(
    request: Request, timestamp: int, db=Depends(get_history_repository)
):
    """
    Get all active events
    """
    return await db.get_active_events(timestamp)
