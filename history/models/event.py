"""
Event schema.
"""

from pydantic import BaseModel, Field
from schemas.message import Message


class Event(BaseModel):
    """
    Event schema.
    """

    id: str
    message: Message
    created_at: int = Field(
        description="UNIX timestamp in milliseconds when the event was created."
    )
    outdated_at: int = Field(
        description="UNIX timestamp in milliseconds when the event was outdated."
    )
    parent_id: str | None = Field(default=None)
    child_id: str | None = Field(default=None)
