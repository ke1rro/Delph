"""
History data service API routers.
"""

from fastapi import APIRouter, Depends
from fastapi.requests import Request
from schemas.message import Message
from repositories.history import HistoryRepository
from starlette.authentication import requires

from api.dependencies import get_history_repository

router = APIRouter(prefix="/filter", tags=["filter"])


@router.get("/events")
async def filter_events_by_time_stamp(
    request: Request,
    start_timestamp: int,
    end_timestamp: int,
    db: HistoryRepository = Depends(get_history_repository),
):
    """
    Returns the events that match the timestamp

    Args:
        start_time (int): The start time to match the events
        end_time (int): The end time to match the events
        db (HistoryRepository, optional): The mongo session
    """
    return await db.get_events_aggregated_by_timestamp(start_timestamp * 1000, end_timestamp * 1000)


# history          |   {'type': 'missing', 'loc': ('response', 1, 'entity'), 'msg': 'Field required', 'input': {'message': {'id': 'c6a00c6a87704fdbaee5869eed331bfc', 'timestamp': 1744711579625, 'ttl': 604800000, 'source': {'id': 'DELTA_USER/e5e54c0c35d74319a37adedcefcebfc8', 'name': 'fkdsfkj', 'comment': 'w'}, 'location': {'latitude': 45.089036, 'longitude': 4.21875, 'altitude': None, 'radius': None}, 'velocity': {'direction': 3.0, 'speed': 3.0}, 'entity': {'affiliation': 'neutral', 'entity': 'space:satellite', 'status': 'disabled'}}}}