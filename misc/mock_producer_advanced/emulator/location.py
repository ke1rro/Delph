from dataclasses import dataclass
from math import asin, atan2, cos, sin, sqrt

EARTH_RADIUS = 6378137


@dataclass
class Location:
    """
    Class representing a geographical location.

    Attributes:
        latitude: Latitude in radians.
        longitude: Longitude in radians.
        altitude: Altitude in meters.
    """

    latitude: float
    longitude: float
    altitude: float

    def distance(self, other: "Location") -> float:
        """
        Calculate the distance between two locations using the Haversine formula.

        Args:
            other: The target location.

        Returns:
            Distance in meters.
        """
        dlon = other.longitude - self.longitude
        dlat = other.latitude - self.latitude
        dalt = other.altitude - self.altitude

        a = (
            sin(dlat / 2) ** 2
            + cos(self.latitude) * cos(other.latitude) * sin(dlon / 2) ** 2
        )
        c = 2 * atan2(sqrt(a), sqrt(1 - a))

        return sqrt((EARTH_RADIUS * c) ** 2 + dalt**2)

    def direction(
        self, other: "Location", distance: float | None = None
    ) -> tuple[float, float]:
        """
        Calculate the azimuth and elevation angle from the current location to another location.

        Args:
            other: The target location.
            distance: Optional distance to the target location in meters.

        Returns:
            A tuple of (azimuth, elevation) in radians.
        """
        if distance is None:
            distance = self.distance(other)

        dlon = other.longitude - self.longitude
        dalt = other.altitude - self.altitude

        x = cos(other.latitude) * sin(dlon)
        y = cos(self.latitude) * sin(other.latitude) - sin(self.latitude) * cos(
            other.latitude
        ) * cos(dlon)

        return atan2(x, y), atan2(dalt, distance)

    def destination(
        self, distance: float, direction: tuple[float, float]
    ) -> "Location":
        """
        Calculate the destination point given a distance and direction from the
        current location.

        Args:
            distance: Distance to the destination point in meters.
            direction: A tuple of (azimuth, elevation) in radians.

        Returns:
            A new Location object representing the destination point.
        """
        cdist = distance * cos(direction[1]) / EARTH_RADIUS
        altdist = distance * sin(direction[1])

        lat = asin(
            sin(self.latitude) * cos(cdist)
            + cos(self.latitude) * sin(cdist) * cos(direction[0])
        )
        lon = self.longitude + atan2(
            sin(direction[0]) * sin(cdist) * cos(self.latitude),
            cos(cdist) - sin(self.latitude) * sin(lat),
        )
        alt = self.altitude + altdist

        return Location(
            latitude=lat,
            longitude=lon,
            altitude=alt,
        )
