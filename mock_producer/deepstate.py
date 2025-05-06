import json
import re
from math import radians

from clients.http import HttpClient
from simulator.battlefield import Battlefield
from simulator.entity import Entity
from simulator.location import Location
from simulator.message_builder import SimpleMessageBuilder
from simulator.noise import NoiseNone
from simulator.object import Object

ICON_REGEX = re.compile(r"icon=([a-zA-Z0-9_]+)")
ICON_MAP = {
    "moscow_ship": Entity(
        affiliation="hostile",
        entity="water:combatant:line",
        status="destroyed",
    ),
    "airport": Entity(
        affiliation="hostile",
        entity="ground:installation:military:base/facility:airport/airbase",
        status="unknown",
    ),
    "headquarter": Entity(
        affiliation="hostile",
        entity="ground:installation:military:base/facility",
        status="unknown",
    ),
}
KEYWORD_MAP = [
    ("мотострілецьк", "ground:ground track:unit:combat:infantry:infantry:motorized"),
    ("мотострілк", "ground:ground track:unit:combat:infantry:infantry:motorized"),
    ("сапер", "ground:ground track:unit:combat:engineer"),
    ("спеціального", "sof:ground"),
    ("танков", "ground:ground track:equipment:ground vehicle:armoured vehicle:tank"),
    ("морської", "sof:sof unit naval:sof unit:seal"),
    ("десантн", "ground:ground track:unit:combat:infantry:infantry:air assault"),
    ("барс", "sof:ground"),
    ("розвідувальн", "ground:ground track:unit:combat:reconnaissance"),
    ("дршбр", "ground:ground track:unit:combat:reconnaissance"),
    (
        "самохідний артилерійськ",
        "ground:ground track:unit:combat:field artillery:howitzer/gun:self propelled",
    ),
    ("артилерійськ", "ground:ground track:unit:combat:field artillery"),
    ("оперативного", "sof:ground"),
    ("стрілецьк", "ground:ground track:unit:combat:infantry"),
    ("отб", "ground:ground track:equipment:ground vehicle:armoured vehicle:tank"),
    ("військова база", "ground:installation:military:base/facility"),
]


def extract_entity(properties: dict) -> Entity | None:
    """
    Extract the entity from the properties dictionary.

    Args:
        properties: The properties dictionary containing entity information.

    Returns:
        An Entity instance or None if the icon is not found in the map.
    """
    icon = re.findall(ICON_REGEX, properties["description"])[0]
    if icon in ICON_MAP:
        return ICON_MAP[icon]

    if icon not in {"enemy", "iblorussia", "eblorussia"}:
        print("Ignoring icon:", icon)
        return None

    for keyword, entity_type in KEYWORD_MAP:
        if keyword in properties["name"].lower():
            return Entity(
                affiliation="hostile",
                entity=entity_type,
                status="unknown",
            )

    print("Entity treated as infantry:", properties["name"])
    return Entity(
        affiliation="hostile",
        entity="ground:ground track:unit:combat:infantry",
        status="unknown",
    )


def load_deepstate_objects() -> list[Object]:
    """
    Load objects from the deepstate.json file.

    Returns:
        A list of Object instances.
    """
    with open("deepstate.json", "r", encoding="utf8") as file:
        features = json.load(file)["map"]["features"]

    objects = []
    for feature in features:
        if feature["geometry"]["type"] != "Point":
            continue

        longitude, latitude, altitude = feature["geometry"]["coordinates"]
        entity = extract_entity(feature["properties"])
        if entity is None:
            continue

        objects.append(
            Object(
                entity=entity,
                location=Location(
                    radians(latitude),
                    radians(longitude),
                    altitude,
                ),
            )
        )

    return objects


def main():
    """
    Main function to create a battlefield and simulate tank movements.
    """
    user_id = "d6d6f0dd-385c-4540-b1af-7d312e41eed5"
    password = "StrongPass!2"

    objects = load_deepstate_objects()

    client = HttpClient("https://delph.live")
    bf = Battlefield(
        client=client, noise=NoiseNone(), message_builder=SimpleMessageBuilder(20000)
    )
    for obj in objects:
        bf.add(obj)

    with client.connect(
        user_id=user_id,
        password=password,
    ):
        bf.simulate(
            duration=600,
            interval=15,
        )


if __name__ == "__main__":
    main()
