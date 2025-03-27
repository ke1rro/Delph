from extract import main as extract
from generate import main as generate
from transform import main as transform


def main():
    extract()
    transform()
    generate()


if __name__ == "__main__":
    main()
