"""
Generate the SIDC JSON file from the prefix tree.
"""

import json
from typing import Generator

TYPES = {
    "U": "underwater",
    "P": "space",
    "S": "water",
    "A": "air",
    "G": "ground",
    "F": "sof",
}
DATA_KEY = "$DATA"


def iterate(tree: dict, path: list[str]) -> Generator[tuple[str, str], None, None]:
    """
    Iterate over the prefix tree and yield the SIDC and its path.
    """
    for key in tree:
        if key == DATA_KEY:
            yield path, tree[key]
        else:
            yield from iterate(tree[key], path + [key])


def main():
    """
    Generate the SIDC JSON file from the prefix tree.
    """
    with open("tree.json", "r", encoding="utf8") as file:
        prefix_tree = json.load(file)

    with open("sidc_basic.json", "r", encoding="utf8") as file:
        sidc_basic = json.load(file)

    tree = {}

    for sidc, type_ in TYPES.items():
        tree[type_] = "S@" + sidc + "#" + "-" * 6

    for path, sidc in iterate(prefix_tree, []):
        if sidc[0] != "S":
            print(f"Invalid scheme: {sidc[0]}")
            continue

        if sidc[1] != "*":
            print(f"Specified affiliation: {sidc[1]}")
            continue

        if sidc[3] != "*":
            print(f"Specified status: {sidc[3]}")
            continue

        if sidc[2] not in TYPES:
            print(f"Unknown type: {sidc[2]}")
            continue

        type_ = TYPES[sidc[2]]
        path = ":".join([type_] + path)

        # Remove unnecessary prefixes
        for prefix, replacement in [
            ("water:sea surface:track", "water"),
            ("underwater:subsurface track", "underwater"),
            ("sof:special operations force (sof) unit:sof unit", "sof"),
            ("sof:special operations force (sof) unit", "sof"),
            ("air:air track", "air"),
            ("space:space track", "space"),
        ]:
            if path.startswith(prefix):
                path = replacement + path.removeprefix(prefix)
                break

        # @ means affiliation
        # # means status
        tree[path] = "S@" + sidc[2] + "#" + sidc[4:]

    sidc_basic["entity"] = tree

    with open("sidc.json", "w", encoding="utf8") as file:
        json.dump(sidc_basic, file, indent=4, sort_keys=True)


if __name__ == "__main__":
    main()
