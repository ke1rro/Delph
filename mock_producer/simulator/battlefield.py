import math
import time

from simulator.client import Client
from simulator.message_builder import MessageBuilder
from simulator.noise import Noise
from simulator.object import Object


class Battlefield:
    """
    Class representing a battlefield with multiple objects.

    Attributes:
        client: The client used to push messages to the server.
        objects: A list of objects on the battlefield.
        ids: A list of message IDs for the objects.
        noise: The noise model applied to the objects.
        message_builder: The message builder used to create messages.
    """

    client: Client
    objects: list[Object]
    ids: list[str]
    noise: Noise
    message_builder: MessageBuilder

    def __init__(self, client: Client, noise: Noise, message_builder: MessageBuilder):
        self.client = client
        self.objects = []
        self.ids = []
        self.noise = noise
        self.message_builder = message_builder

    def add(self, obj: Object):
        """
        Add an object to the battlefield.

        Args:
            obj: The object to add.
        """
        self.objects.append(obj)
        self.ids.append(None)

    def push(self, index: int, ttl: int, comment: str | None = None):
        """
        Push the object to the server.

        Args:
            index: The index of the object to push.
            ttl: The time-to-live for the message in milliseconds.
            comment: A comment to include in the message.
        """
        obj = self.objects[index]
        if not obj.active:
            return

        id_ = self.ids[index]
        location, radius = self.noise.apply(obj)
        velocity = obj.velocity

        message = {
            "location": {
                "latitude": math.degrees(location.latitude),
                "longitude": math.degrees(location.longitude),
                "altitude": location.altitude,
            },
            "velocity": {
                "speed": velocity.speed,
                "direction": math.degrees(velocity.direction) % 360,
            },
            "entity": {
                "affiliation": obj.entity.affiliation,
                "entity": obj.entity.entity,
                "status": obj.entity.status,
            },
            "comment": comment,
            "ttl": ttl,
        }
        if id_ is not None:
            message["message_id"] = id_
        if radius > 0:
            message["location"]["radius"] = radius

        self.ids[index] = self.client.push(message)

    def _step(self, iteration: int, deltatime: float):
        for index, obj in enumerate(self.objects):
            obj.simulate(deltatime)

            message = self.message_builder.build(obj, iteration)
            if message is None:
                continue
            self.push(index, *message)

    def simulate(self, duration: float, interval: float):
        """
        Simulate the battlefield for a given duration and interval.

        Args:
            duration: The total duration of the simulation in seconds.
            interval: The time interval for each simulation step in seconds.
        """
        for iteration in range(int(duration // interval)):
            self._step(iteration, interval)
            time.sleep(interval)
