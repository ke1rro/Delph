from abc import ABC, abstractmethod

from emulator.location import Location
from emulator.object import Object


class Noise(ABC):
    """
    Abstract base class for noise models.

    This class defines the interface for applying noise to an object.
    Subclasses should implement the `apply` method to define how noise is applied.
    """

    @abstractmethod
    def apply(self, obj: Object) -> tuple[Location, float]:
        """
        Apply noise to the object.

        Args:
            obj: The object to which noise will be applied.

        Returns:
            A tuple containing the new location and the radius in meters.
        """


class NoiseNone(Noise):
    """
    Class representing no noise model.
    """

    def apply(self, obj: Object) -> tuple[Location, float]:
        """
        Apply no noise to the object.

        Args:
            obj: The object to which noise will be applied.

        Returns:
            A tuple containing the original location and a radius of 0 meters.
        """
        return obj.location, 0.0
