"""
History data service API routers.
"""

from typing import Annotated

from fastapi import APIRouter, Depends, Query
from fastapi.requests import Request
from pydantic import BaseModel
from repositories.history import HistoryRepository
from starlette.authentication import requires

from api.dependencies import get_history_repository
from schemas.message import Message

router = APIRouter(tags=["history"])


class MessageRow(BaseModel):
    """
    Message row schema encapsulating the message data.
    """

    message: Message


@router.get("/events")
async def filter_events_by_time_stamp(
    request: Request,
    start_timestamp: Annotated[int | None, Query()] = None,
    end_timestamp: Annotated[int | None, Query()] = None,
    entities: Annotated[list[str] | None, Query()] = None,
    statuses: Annotated[list[str] | None, Query()] = None,
    affiliations: Annotated[list[str] | None, Query()] = None,
    repo: HistoryRepository = Depends(get_history_repository),
) -> list[MessageRow]:
    """
    Returns the events that match the timestamp

    Args:
        request: The request object.
        filters: The filters to apply.
        repo: The history repository.

    Returns:
        A list of message rows that match the filters.
    """
    if start_timestamp is not None:
        start_timestamp = start_timestamp * 1000
    if end_timestamp is not None:
        end_timestamp = end_timestamp * 1000

    return await repo.filter_events(
        start_timestamp=start_timestamp,
        end_timestamp=end_timestamp,
        entities=entities,
        statuses=statuses,
        affiliations=affiliations,
    )
