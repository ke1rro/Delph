import math
import random
import time
from typing import List

from clients.http import HttpClient
from simulator.entity import Entity


class Missile:
    """
    Represents a missile in flight from a plane toward a target
    """

    def __init__(
        self,
        client,
        source_lat,
        source_lon,
        source_alt,
        target_lat,
        target_lon,
        target_alt,
        affiliation="friend",
    ):
        self.client = client
        self.message_id = None
        self.latitude = source_lat
        self.longitude = source_lon
        self.altitude = source_alt
        self.target_lat = target_lat
        self.target_lon = target_lon
        self.target_alt = target_alt
        self.speed = 100.0
        self.created_at = time.time()
        self.lifetime = 4.0
        self.lat_diff = target_lat - source_lat
        self.lon_diff = target_lon - source_lon
        self.alt_diff = target_alt - source_alt
        distance = math.sqrt(self.lat_diff**2 + self.lon_diff**2 + self.alt_diff**2)
        if distance > 0:
            self.lat_unit = self.lat_diff / distance
            self.lon_unit = self.lon_diff / distance
            self.alt_unit = self.alt_diff / distance
        else:
            self.lat_unit = 0
            self.lon_unit = 1
            self.alt_unit = 0
        self.initial_lat = source_lat
        self.initial_lon = source_lon
        self.initial_alt = source_alt
        self.entity = Entity(
            affiliation=affiliation,
            entity="air:weapon:missile in flight",
            status="unknown",
        )

    def update_position(self):
        """Update missile position and send to server"""
        if time.time() - self.created_at > self.lifetime:
            if self.message_id:
                self.message_id = None
            return False
        self.latitude += self.lat_unit * self.speed
        self.longitude += self.lon_unit * self.speed
        elapsed = time.time() - self.created_at
        arc_factor = 500 * math.sin(math.pi * elapsed / self.lifetime)
        self.altitude += self.alt_unit * self.speed * 200 + arc_factor
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
        message["comment"] = "Missile"
        if self.message_id:
            message["message_id"] = self.message_id
        try:
            self.message_id = self.client.push(message)
            return True
        except Exception as e:
            print(f"Error updating missile: {e}")
            return False


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

    def fire_missile_at(self, target_plane):
        """Fire a missile at the target plane"""
        missile = Missile(
            client=self.client,
            source_lat=self.latitude,
            source_lon=self.longitude,
            source_alt=self.altitude,
            target_lat=target_plane.latitude,
            target_lon=target_plane.longitude,
            target_alt=target_plane.altitude,
            affiliation=self.affiliation,
        )

        return missile


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
    missiles = []

    missile_chance = 0.05
    last_missile_time = time.time()
    missile_cooldown = 8.0

    with client.connect(
        user_id=user_id,
        password=password,
    ):
        duration = 600
        interval = 0.05
        start_time = time.time()
        while time.time() - start_time < duration:
            for plane in all_planes:
                plane.update_position()
            current_time = time.time()
            if current_time - last_missile_time > missile_cooldown:
                for friendly_plane in friendly_planes:
                    if random.random() < missile_chance:
                        closest_hostile = min(
                            hostile_planes,
                            key=lambda h: (h.latitude - friendly_plane.latitude) ** 2
                            + (h.longitude - friendly_plane.longitude) ** 2,
                        )

                        missile = friendly_plane.fire_missile_at(closest_hostile)
                        missiles.append(missile)
                        print(
                            f"Missile fired at ({missile.target_lat}, {missile.target_lon})"
                        )
                        last_missile_time = current_time
                        break
            active_missiles = []
            for missile in missiles:
                try:
                    if missile.update_position():
                        active_missiles.append(missile)
                except Exception as e:
                    print(f"Error with missile: {e}")
            missiles = active_missiles
            time.sleep(interval)


if __name__ == "__main__":
    main()
