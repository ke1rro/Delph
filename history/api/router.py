"""
History data service API routers.
"""

from fastapi import APIRouter, Depends
from fastapi.requests import Request
from models.event import Event
from repositories.history import HistoryRepository
from starlette.authentication import requires

from api.dependencies import get_history_repository

router = APIRouter(prefix="/filter", tags=["filter"])


@router.get("/events")
@requires(["authenticated"])
async def filter_events_by_time_stamp(
    request: Request,
    start_timestamp: int,
    end_timestamp: int,
    db: HistoryRepository = Depends(get_history_repository),
) -> list[Event,]:
    """
    Returns the events that match the timestamp

    Args:
        start_time (int): The start time to match the events
        end_time (int): The end time to match the evenets
        db (HistoryRepository, optional): The mongo session
    """
    return await db.get_events_aggregated_by_message_id(start_timestamp * 1000, end_timestamp * 1000)
