"""App"""

import asyncio

from db.models import init_models


async def main() -> None:
    """
    Entry point
    """
    await init_models()


if __name__ == "__main__":
    asyncio.run(main())
