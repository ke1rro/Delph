import json

import pandas

DATA_KEY = "$SIDC"


def append(tree: dict, path: list[str], data: str):
    for node in path:
        node = node.lower()
        tree.setdefault(node, {})
        tree = tree[node]

    tree[DATA_KEY] = data


def smash(parent, tree, node):
    if len(tree) == 1 and DATA_KEY not in tree:
        subnode = next(iter(tree.keys()))

        parent[" ".join([node, subnode])] = tree[subnode]
        del parent[node]

        smash(parent, tree[subnode], " ".join([node, subnode]))
    else:
        for subnode in list(tree.keys()):
            if subnode == DATA_KEY:
                continue
            smash(tree, tree[subnode], subnode)


def main():
    prefix_tree = {}

    # Load data into the prefix tree
    data = pandas.read_csv("data.csv")
    for _, row in data.iterrows():
        path = list(filter(None, row["Entry"].replace(",", "").split(" ")))
        append(prefix_tree, path, row["SIDC"])

    # Smash tree chains
    for node in list(prefix_tree.keys()):
        smash(prefix_tree, prefix_tree[node], node)

    # Save the tree
    with open("tree.json", "w") as file:
        json.dump(prefix_tree, file, indent=4)


main()
