import random
from math import radians

from clients.http import HttpClient
from simulator.battlefield import Battlefield
from simulator.entity import Entity
from simulator.location import Location
from simulator.message_builder import SimpleMessageBuilder
from simulator.noise import NoiseNone
from simulator.object import Object
from simulator.waypoint import WaypointMove


def create_tank(
    latitude: float,
    longitude: float,
    target_latitude: float,
    target_longitude: float,
    speed: float,
) -> Object:
    """
    Create a tank object with a waypoint move.

    Args:
        latitude: Latitude of the tank's initial position.
        longitude: Longitude of the tank's initial position.
        target_latitude: Latitude of the target position.
        target_longitude: Longitude of the target position.
        speed: Speed of the tank in m/s.

    Returns:
        The tank object with the waypoint move.
    """
    entity = Entity(
        affiliation="friend",
        entity=(
            "ground:ground track:equipment:ground vehicle:"
            "armoured vehicle:tank:tank:light"
        ),
        status="unknown",
    )
    obj = Object(
        entity=entity,
        location=Location(
            latitude=radians(latitude),
            longitude=radians(longitude),
            altitude=0,
        ),
    )
    obj.add(
        WaypointMove(
            entity=entity,
            target=Location(
                latitude=radians(target_latitude),
                longitude=radians(target_longitude),
                altitude=0,
            ),
            speed=speed,
        )
    )
    return obj


def main():
    """
    Main function to create a battlefield and simulate tank movements.
    """
    latitude = 55.75299231355623
    latitude_delta = 0.01
    longitude = 37.6214276207942
    longitude_delta = 0.01
    speed = 20
    speed_delta = 5
    user_id = "b567f41e-76dd-4728-a5d9-4df9927dfc8e"
    password = "qwerty!23Q"

    client = HttpClient("http://localhost:8000/")

    bf = Battlefield(
        client=client, noise=NoiseNone(), message_builder=SimpleMessageBuilder(5000000)
    )

    for _ in range(10):
        tank = create_tank(
            latitude=latitude + random.uniform(-latitude_delta, latitude_delta),
            longitude=longitude + random.uniform(-longitude_delta, longitude_delta),
            target_latitude=latitude + random.uniform(-latitude_delta, latitude_delta),
            target_longitude=longitude
            + random.uniform(-longitude_delta, longitude_delta),
            speed=speed + random.uniform(-speed_delta, speed_delta),
        )
        bf.add(tank)

    with client.connect(
        user_id=user_id,
        password=password,
    ):
        bf.simulate(
            duration=200,
            interval=0.2,
        )


if __name__ == "__main__":
    main()
