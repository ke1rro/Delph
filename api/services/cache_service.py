from core.redis import RedisClient


class CacheService:
    """
    Cache service implementation
    """

    def __init__(self):
        self.redis = RedisClient()

    async def set(self, key: str, value: str, expire: int = None) -> None:
        """
        Set a key-value pair in the cache with an optional expiration time.

        Args:
            key (str): The key to set
            value (str): The value to set
            expire (int): Expiration time in seconds (optional)

        Returns:
            None
        """
        await self.redis.set(key, value, ex=expire)

    async def get(self, key: str) -> str:
        """
        Get a value from the cache.

        Args:
            key (str): The key to get

        Returns:
            str: The value of the key
        """
        return await self.redis.get(key)

    async def blacklist_token(self, token: str, expire: int) -> None:
        """
        Add a token to the blacklist with an expiration time.

        Args:
            token (str): The token to blacklist
            expire (int): Expiration time for the token in seconds

        Returns:
            None
        """
        await self.set(f"blacklist:{token}", "blacklisted", expire)

    async def is_token_blacklisted(self, token: str) -> bool:
        """
        Check if a token is blacklisted.

        Args:
            token (str): The token to check

        Returns:
            bool: True if the token is blacklisted, False otherwise
        """
        return await self.get(f"blacklist:{token}") is not None