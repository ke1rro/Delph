import time

from clients.http import HttpClient
from simulator.entity import Entity


class SimplePlane:
    """
    A simplified plane that moves in a rectangular path by direct coordinate increments.
    """

    def __init__(self, client):
        self.client = client
        self.message_id = None
        self.latitude = 60.0
        self.longitude = -170.0
        self.altitude = 10000
        self.direction = "east"

        self.lat_increment = 0.5
        self.lon_increment = 0.5
        self.north_edge = 60.0
        self.south_edge = -60.0
        self.east_edge = 170.0
        self.west_edge = -170.0

        self.entity = Entity(
            affiliation="friend",
            entity="air:military:fixed wing:fighter",
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
        if self.message_id:
            message["message_id"] = self.message_id
        self.message_id = self.client.push(message)


def main():
    """
    Main function to create a plane and simulate its movement around the world.
    """
    user_id = "aabb78734fb34946920fac8069ec2503"
    password = "StrongPass!2"

    client = HttpClient("http://localhost:8000/")
    plane = SimplePlane(client)
    with client.connect(
        user_id=user_id,
        password=password,
    ):
        duration = 600
        interval = 0.1
        start_time = time.time()
        while time.time() - start_time < duration:
            plane.update_position()
            time.sleep(interval)


if __name__ == "__main__":
    main()
