from collections import deque
from dataclasses import dataclass

from emulator.entity import Entity
from emulator.location import Location
from emulator.velocity import Velocity
from emulator.waypoint import Waypoint


@dataclass
class Object:
    """
    Represents an object in the simulation.

    Attributes:
        entity: The entity associated with the object.
        location: The current location of the object.
        waypoints: A deque of waypoints for the object to follow.
    """

    entity: Entity
    location: Location
    waypoints: deque[Waypoint]

    def __init__(self, entity: Entity, location: Location):
        self.entity = entity
        self.location = location
        self.waypoints = deque()

    @property
    def active(self) -> bool:
        """
        Check if the object is active.

        Returns:
            True if the object is active, False otherwise.
        """
        return self.entity is not None

    @property
    def target(self) -> Waypoint | None:
        """
        Get the current target waypoint.

        Returns:
            The current target waypoint or None if there are no waypoints.
        """
        return self.waypoints[0] if self.waypoints else None

    @property
    def velocity(self) -> Velocity:
        """
        Get the velocity of the object.

        Returns:
            The velocity of the object.
        """
        if self.target is None:
            return Velocity(0.0, 0.0)

        return Velocity(
            self.target.get_speed(self.location),
            self.target.get_bearing(self.location),
        )

    def add(self, waypoint: Waypoint):
        """
        Add a waypoint to the object.

        Args:
            waypoint: The waypoint to add.
        """
        self.waypoints.append(waypoint)

    def simulate(self, deltatime: float):
        """
        Simulate the movement of the object.

        Args:
            deltatime: The time delta for the simulation.
        """
        if not self.waypoints:
            return

        new_location, reached = self.target.update(self.location, deltatime)

        if reached:
            self.entity = self.target.entity
            self.waypoints.popleft()

        self.location = new_location
