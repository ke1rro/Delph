from dataclasses import dataclass


@dataclass
class Entity:
    """
    Represents an entity in the simulation.
    For details check message schema.

    Attributes:
        affiliation: The affiliation of the entity (e.g., friend, hostile).
        entity: The entity path according to APP6B.
        status: The status of the entity (e.g., active, disabled).
    """

    affiliation: str
    entity: str
    status: str
