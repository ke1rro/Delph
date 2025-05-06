import time

from clients.http import HttpClient
from simulator.entity import Entity


class SimplePlane:
    """
    A simplified plane that moves in a rectangular path by direct coordinate increments.
    """

    def __init__(
        self,
        client,
        initial_lat,
        initial_lon,
        initial_direction,
        affiliation="friend",
        plane_type="fixed wing",
        is_leader=False,
    ):
        self.client = client
        self.message_id = None
        self.latitude = initial_lat
        self.longitude = initial_lon
        self.altitude = 10000 + (
            0 if is_leader else (1000 if affiliation == "friend" else -1000)
        )
        self.direction = initial_direction
        self.affiliation = affiliation
        self.is_leader = is_leader
        self.lat_increment = 0.5 if affiliation == "hostile" else 0.55
        self.lon_increment = 0.5 if affiliation == "hostile" else 0.55

        self.north_edge = 60.0
        self.south_edge = -60.0
        self.east_edge = 170.0
        self.west_edge = -170.0
        self.entity = Entity(
            affiliation=affiliation,
            entity="air:military:fixed wing",
            status="unknown",
        )

    def update_position(self):
        """Simply update position according to current direction"""
        if self.direction == "east":
            self.longitude += self.lon_increment
            if self.longitude >= self.east_edge:
                self.direction = "south"
                self.longitude = self.east_edge

        elif self.direction == "south":
            self.latitude -= self.lat_increment
            if self.latitude <= self.south_edge:
                self.direction = "west"
                self.latitude = self.south_edge

        elif self.direction == "west":
            self.longitude -= self.lon_increment
            if self.longitude <= self.west_edge:
                self.direction = "north"
                self.longitude = self.west_edge

        elif self.direction == "north":
            self.latitude += self.lat_increment
            if self.latitude >= self.north_edge:
                self.direction = "east"
                self.latitude = self.north_edge

        message = {
            "location": {
                "latitude": self.latitude,
                "longitude": self.longitude,
                "altitude": self.altitude,
            },
            "entity": {
                "affiliation": self.entity.affiliation,
                "entity": self.entity.entity,
                "status": self.entity.status,
            },
            "ttl": 1000,
        }

        if self.is_leader:
            message["comment"] = f"{self.affiliation.capitalize()} Leader"

        if self.message_id:
            message["message_id"] = self.message_id
        self.message_id = self.client.push(message)


def create_hostile_formation(client):
    """Create a formation of 4 hostile planes - positioned well ahead of friendlies"""
    planes = []
    leader = SimplePlane(
        client=client,
        initial_lat=60.0,
        initial_lon=-120.0,
        initial_direction="east",
        affiliation="hostile",
        is_leader=True,
    )
    planes.append(leader)
    planes.append(
        SimplePlane(
            client=client,
            initial_lat=59.0,
            initial_lon=-121.0,
            initial_direction="east",
            affiliation="hostile",
        )
    )

    planes.append(
        SimplePlane(
            client=client,
            initial_lat=59.0,
            initial_lon=-119.0,
            initial_direction="east",
            affiliation="hostile",
        )
    )

    planes.append(
        SimplePlane(
            client=client,
            initial_lat=58.0,
            initial_lon=-120.0,
            initial_direction="east",
            affiliation="hostile",
        )
    )

    return planes


def create_friendly_formation(client):
    """Create a formation of 3 friendly planes that chase the hostiles"""
    planes = []
    leader = SimplePlane(
        client=client,
        initial_lat=60.0,
        initial_lon=-150.0,
        initial_direction="east",
        affiliation="friend",
        is_leader=True,
    )
    planes.append(leader)

    planes.append(
        SimplePlane(
            client=client,
            initial_lat=59.0,
            initial_lon=-151.0,
            initial_direction="east",
            affiliation="friend",
        )
    )

    planes.append(
        SimplePlane(
            client=client,
            initial_lat=59.0,
            initial_lon=-149.0,
            initial_direction="east",
            affiliation="friend",
        )
    )

    return planes


def main():
    """
    Main function to create multiple planes and simulate their movements.
    """
    user_id = "aabb78734fb34946920fac8069ec2503"
    password = "StrongPass!2"

    client = HttpClient("http://localhost:8000/")
    hostile_planes = create_hostile_formation(client)
    friendly_planes = create_friendly_formation(client)
    all_planes = hostile_planes + friendly_planes

    with client.connect(
        user_id=user_id,
        password=password,
    ):
        duration = 600
        interval = 0.1
        start_time = time.time()
        while time.time() - start_time < duration:
            for plane in all_planes:
                plane.update_position()
            time.sleep(interval)


if __name__ == "__main__":
    main()
