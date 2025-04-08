from dataclasses import dataclass


@dataclass
class Velocity:
    """
    Represents the velocity of an object in the simulation.

    Attributes:
        speed: The speed of the object in meters per second.
        direction: The direction of the object in radians.
    """

    speed: float
    direction: float
