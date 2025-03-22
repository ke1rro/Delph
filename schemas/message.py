"""
Models representing the shared schema of the message object.

Our models are based on APP6C NATO Joint Military Symbology. The
JSON schema fully describes the message object and its properties, except
the list of available entities and modifiers.
"""

from typing import Literal

from pydantic import BaseModel, Field


class Location(BaseModel):
    """
    Model representing location and accuracy information of the message.
    """

    latitude: float = Field(ge=-90, le=90, description="Latitude in degrees.")
    longitude: float = Field(gt=-180, le=180, description="Longitude in degrees.")

    altitude: float | None = Field(
        default=None, description="Elevation above mean sea level in meters."
    )
    radius: float | None = Field(
        default=None,
        gt=0,
        description="Maxium deviation from the actual location in meters.",
    )


class Velocity(BaseModel):
    """
    Model representing velocity (direction and speed) information of the message.
    """

    direction: float | None = Field(
        default=None,
        ge=0,
        lt=360,
        description=(
            "Movement direction in degrees, where 0 degrees is North, "
            "90 degrees is East and so on."
        ),
    )
    speed: float | None = Field(
        default=None, ge=0, description="Movement speed in meters per second."
    )


class Source(BaseModel):
    """
    Model representing source information of the message.
    """

    id: str = Field(description="Unique identifier of the data source.")
    name: str | None = Field(default=None, description="Name of the source.")
    comment: str | None = Field(
        default=None,
        max_length=256,
        description="Comment from the data collection unit.",
    )


class Entity(BaseModel):
    """
    Model representing entity details.
    """

    affiliation: Literal[
        "assumed_friend",
        "friend",
        "hostile",
        "suspect",
        "neutral",
        "unknown",
        "pending",
    ] = Field(description="Affiliation of the entity.")
    type: Literal["land", "air", "water", "underwater"] = Field(
        description="Type of the entity."
    )
    entity: str = Field(description="Entity according to APP6C.")
    modifier1: str | None = Field(
        default=None, description="Modifier 1 according to APP6C."
    )
    modifier2: str | None = Field(
        default=None, description="Modifier 2 according to APP6C."
    )
    status: Literal["active", "disabled", "destroyed", "unknown"] = Field(
        default="unknown", description="Status of the entity."
    )


class Message(BaseModel):
    """
    Model representing message information.
    """

    id: str = Field(description="Unique identifier of the message.")

    timestamp: int = Field(
        description="UNIX timestamp in milliseconds when the data was collected."
    )
    ttl: int = Field(
        default=7 * 24 * 60 * 60,
        ge=0,
        le=7 * 24 * 60 * 60,
        description="Time-to-live in seconds. The message is valid for this duration. If 0, then removes the message.",
    )

    source: Source

    location: Location = Field(description="Location of the entity.")
    velocity: Velocity | None = Field(
        default=None, description="Velocity of the entity."
    )

    entity: Entity = Field(description="Details describing the message's entity.")


if __name__ == "__main__":
    import json

    schema = Message.model_json_schema()
    print(json.dumps(schema, indent=2))