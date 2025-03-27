"""
Extract, transform, and generate the SIDC JSON file.
"""

from extract import main as extract
from generate import main as generate
from transform import main as transform


def main():
    """
    Extract, transform, and generate the SIDC JSON file.
    """
    extract()
    transform()
    generate()


if __name__ == "__main__":
    main()
