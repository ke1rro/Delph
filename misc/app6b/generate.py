import json
from typing import Generator

DATA_KEY = "$SIDC"

with open("tree.json", "r") as file:
    prefix_tree = json.load(file)

with open("sidc_basic.json", "r") as file:
    sidc_basic = json.load(file)

sidc_basic["entity"] = {}


def iterate(tree: dict, path: list[str]) -> Generator[tuple[str, str], None, None]:
    for node in tree:
        if node == DATA_KEY:
            yield path, tree[node]
        else:
            yield from iterate(tree[node], path + [node])


def lookup(tree: dict, value: str) -> str | None:
    for key, val in tree.items():
        if val == value:
            return key

    return None


def extract_filters(sidc: str) -> dict | None:
    if sidc[0] != "S":
        return None

    filters = {}

    for char, name in zip(sidc[1:], ["affiliation", "type", "status"]):
        if char == "*":
            continue

        value = lookup(sidc_basic[name], char)
        if value is None:
            return None

        filters[name] = value

    return filters


for path, sidc in iterate(prefix_tree, []):
    filters = extract_filters(sidc[:4])
    if filters is None:
        print(f"Skipped {':'.join(path)}")
        continue

    sidc_basic["entity"][":".join(path)] = {
        "sidc": sidc[4:],
        "filters": filters,
    }

with open("sidc.json", "w") as file:
    json.dump(sidc_basic, file, indent=4)
