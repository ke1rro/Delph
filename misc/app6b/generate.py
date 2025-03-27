import json
from typing import Generator


def iterate(tree: dict, path: list[str]) -> Generator[tuple[str, str], None, None]:
    for node in tree:
        if not node:
            yield path, tree[node]
        else:
            yield from iterate(tree[node], path + [node])


def lookup_type(tree: dict, value: str) -> str | None:
    for key, val in tree["type"].items():
        if val == value:
            return key

    return None


def main():
    with open("tree.json", "r") as file:
        prefix_tree = json.load(file)

    with open("sidc_basic.json", "r") as file:
        sidc_basic = json.load(file)

    tree = {}
    for path, sidc in iterate(prefix_tree, []):
        type_ = lookup_type(sidc_basic, sidc[2])
        if type_ is None:
            print(f"Unknown type: {sidc[2]}")
            continue

        tree.setdefault(type_, {})
        tree[type_][":".join(path)] = sidc[4:]

    sidc_basic["entity"] = tree

    with open("sidc.json", "w") as file:
        json.dump(sidc_basic, file, indent=4)


if __name__ == "__main__":
    main()
