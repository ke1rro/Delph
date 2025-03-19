from core.config import settings
from redis.asyncio import Redis


class RedisClient:
    """
    Base setting for Redis
    """
    def __init__(self):
        self.redis = Redis.from_url(settings.redis.redis_url)

    async def set(self, key: str, value: str, ex: int = None) -> None:
        """
        Set a key-value pair in Redis with an optional expiration time.

        Args:
            key (str): The key to set
            value (str): The value to set
            ex (int): Expiration time in seconds (optional)

        Returns:
            None
        """
        await self.redis.set(key, value, ex=ex)

    async def get(self, key: str) -> str:
        """
        Get the value of a key from Redis.

        Args:
            key (str): The key to retrieve

        Returns:
            str: The value of the key, or None if the key does not exist
        """
        return await self.redis.get(key)