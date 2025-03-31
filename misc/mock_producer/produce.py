import random
import time
from dataclasses import dataclass

import requests


class Client:
    def __init__(self):
        self.session = requests.Session()

    def login(self, user_id: str, password: str):
        response = self.session.post(
            "http://localhost:8000/api/core/auth/login",
            json={"user_id": user_id, "password": password},
        )
        response.raise_for_status()

    def push(self, message: dict) -> str:
        response = self.session.put(
            "http://localhost:8000/api/bridge/messages", json=message
        )
        response.raise_for_status()
        return response.json()["id"]

    def close(self):
        self.session.close()


@dataclass
class Tank:
    latitude: float
    longitude: float
    event_id: str | None = None

    def move(self, target_lat: float, target_lon: float):
        self.latitude += (target_lat - self.latitude) * random.uniform(0.01, 0.03)
        self.longitude += (target_lon - self.longitude) * random.uniform(0.01, 0.03)

    def push(self, client: Client):
        message = {
            "location": {
                "latitude": self.latitude,
                "longitude": self.longitude,
            },
            "ttl": 1000,
            "entity": {
                "affiliation": "friend",
                "entity": (
                    "ground:ground track:equipment:ground vehicle:"
                    "armoured vehicle:tank:tank:light"
                ),
                "status": "unknown",
            },
        }
        if self.event_id:
            message["message_id"] = self.event_id

        self.event_id = client.push(message)


def simulate(
    tanks: list[Tank],
    client: Client,
    latitude: float,
    longitude: float,
    iterations: int = 1000,
    time_delta: float = 0.2,
):
    for tank in tanks:
        tank.push(client)

    for _ in range(iterations):
        time.sleep(time_delta)
        for tank in tanks:
            tank.move(latitude, longitude)
            tank.push(client)


def main():
    latitude = 55.75299231355623
    latitude_delta = 0.01
    longitude = 37.6214276207942
    longitude_delta = 0.01

    client = Client()
    client.login(
        user_id="81ab4d00-dd83-4b42-8301-e82c6bf5372f", password="StrongPass!2"
    )
    tanks = [
        Tank(
            latitude=random.uniform(
                latitude - latitude_delta, latitude + latitude_delta
            ),
            longitude=random.uniform(
                longitude - longitude_delta, longitude + longitude_delta
            ),
        )
        for _ in range(10)
    ]

    try:
        simulate(tanks, client, latitude, longitude, iterations=1000, time_delta=0.2)
    finally:
        client.close()


if __name__ == "__main__":
    main()
