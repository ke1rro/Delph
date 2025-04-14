"""
History data service API routers.
"""

from fastapi import APIRouter, Depends, HTTPException
from fastapi.requests import Request
from models.event import Event
from pydantic import BaseModel
from repositories.history import HistoryRepository
from starlette.authentication import requires

from api.dependencies import get_history_repository

router = APIRouter(tags=["history"])


class CreateEvent(BaseModel):
    """
    Create message request schema.
    """

    event: Event


@router.get("/events/aggregated-by-message/")
@requires(["authenticated"])
async def get_events_aggregated_by_message(
    request: Request,
    start_timestamp: int,
    end_timestamp: int,
    db: HistoryRepository = Depends(get_history_repository),
):
    """
    Get events within a time range, aggregated by message.id.
    Returns only the latest version of each message in the specified time range.

    Args:
        start_timestamp: Start time as Unix timestamp (e.g., for July 1, 2025)
        end_timestamp: End time as Unix timestamp (e.g., for July 3, 2025)

    Returns:
        List of latest events for each unique message.id in the time range
    """
    try:
        events = await db.get_events_aggregated_by_message_id(
            start_timestamp, end_timestamp
        )
        return events
    except Exception as e:
        print(f"Error in get_events_aggregated_by_message: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))
