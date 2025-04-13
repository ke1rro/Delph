"""
History data  service entry point.
"""

from fastapi import APIRouter, Depends
from pydantic import BaseModel, Field

from api.dependencies import get_history_repository
from models.event import Event
from repositories.history import HistoryRepository

router = APIRouter(tags=["test"])


class CreateEvent(BaseModel):
    """
    Create message request schema.
    """

    event: Event


@router.get("/history")
async def get_data(db: HistoryRepository = Depends(get_history_repository)):
    """
    Get history data.
    """

    return await db.get_all_events()


# @router.post("/history")
# async def post_message(event: Event, db=Depends(get_history_repository)):
#     await db.save_event(event)
#     return await db.get_event_by_id(event.id)


@router.get("/history/{id}")
async def get_active_event_by_message_id(
    id: str, timestamp: int, db=Depends(get_history_repository)
):
    """
    Get active event by message_id
    """
    return await db.get_active_event_by_message_id(id, timestamp)


@router.get("/history/")
async def get_active_events(timestamp: int, db=Depends(get_history_repository)):
    """
    Get all active events
    """
    return await db.get_active_events(timestamp)
