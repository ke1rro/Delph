"""
User repository to interact with the database.
"""

from repositories.base import Repository

from cache.redis import RedisClient


class UserRepository(Repository):
    """
    User repository to interact with the database.

    Attributes:
        client: Redis client instance.
    """

    client: RedisClient

    def __init__(self, client: RedisClient):
        self.client = client

    async def is_token_valid(self, token: str) -> bool:
        """
        Check if the token is valid.

        Args:
            token: The token to check.

        Returns:
            True if the token is valid, False otherwise.
        """
        return await self.client.is_user_whitelisted(token)
