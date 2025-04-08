from abc import ABC, abstractmethod

from simulator.entity import Entity
from simulator.location import Location


class Waypoint(ABC):
    """
    Abstract base class for waypoints in the simulation.

    Attributes:
        entity: The entity associated with the waypoint.
    """

    entity: Entity

    def __init__(self, entity: Entity):
        self.entity = entity

    @abstractmethod
    def get_bearing(self, point: Location) -> float:
        """
        Calculate the bearing from the current location to the target location.

        Args:
            point: The current location of the entity.

        Returns:
            The bearing in radians.
        """

    @abstractmethod
    def get_speed(self, point: Location) -> float:
        """
        Calculate the speed of the entity at the current location.

        Args:
            point: The current location of the entity.

        Returns:
            The speed in meters per second.
        """

    @abstractmethod
    def update(self, point: Location, deltatime: float) -> tuple[Location, bool]:
        """
        Update the waypoint based on the current location and time delta.

        Args:
            point: The current location of the entity.
            deltatime: The time delta for the update.

        Returns:
            A tuple containing the new location of the entity and a boolean
            indicating whether the waypoint has been reached.
        """


class WaypointMove(Waypoint):
    """
    Represents a waypoint that moves towards a target location.

    Attributes:
        target: The target location to move towards.
        speed: The speed of the entity in meters per second.
    """

    target: Location
    speed: float

    def __init__(self, entity: Entity, target: Location, speed: float):
        super().__init__(entity)
        self.target = target
        self.speed = speed

    def get_bearing(self, point: Location) -> float:
        """
        Calculate the bearing from the current location to the target location.

        Args:
            point: The current location of the entity.

        Returns:
            The bearing in radians.
        """
        return point.direction(self.target)[0]

    def get_speed(self, point: Location) -> float:
        """
        Calculate the speed of the entity at the current location.

        Args:
            point: The current location of the entity.

        Returns:
            The speed in meters per second.
        """
        return self.speed

    def update(self, point: Location, deltatime: float) -> tuple[Location, bool]:
        """
        Move the point towards the waypoint.

        Args:
            point: The current location of the entity.
            deltatime: The time delta for the movement.

        Returns:
            A tuple containing the new location of the entity and a boolean
            indicating whether the waypoint has been reached.
        """
        distance = point.distance(self.target)
        if distance < self.speed * deltatime:
            return self.target, True

        direction = point.direction(self.target)
        new_point = point.destination(self.speed * deltatime, direction)
        return new_point, False


class WaypointWait(Waypoint):
    """
    Represents a waypoint with a wait time in the simulation.

    Attributes:
        wait_time: The time to wait at the waypoint before proceeding.
    """

    wait_time: float

    def __init__(self, entity: Entity, wait_time: float):
        super().__init__(entity)
        self.wait_time = wait_time

    def get_bearing(self, point: Location) -> float:
        """
        Calculate the bearing from the current location to the target location.

        Args:
            point: The current location of the entity.

        Returns:
            The bearing in radians.
        """
        return 0.0

    def get_speed(self, point: Location) -> float:
        """
        Calculate the speed of the entity at the current location.

        Args:
            point: The current location of the entity.

        Returns:
            The speed in meters per second.
        """
        return 0.0

    def update(self, point: Location, deltatime: float) -> tuple[Location, bool]:
        """
        Wait at the waypoint for the specified time.

        Args:
            point: The current location of the entity.
            deltatime: The time delta for the wait.

        Returns:
            A tuple containing the current location of the entity and a boolean
            indicating whether the waypoint has been reached.
        """
        self.wait_time -= deltatime
        return point, self.wait_time <= 0
