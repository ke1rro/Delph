"""
Redis client module for interacting with Redis hash tables.
"""

import json

from redis.asyncio import Redis

from auth.config import settings
from auth.logger import logger


class RedisClient:
    """
    Redis client with enhanced functionality, using JSON and Redis hash tables.
    """

    def __init__(self):
        self.redis = Redis.from_url(settings.redis.redis_url)

    async def set_hash(self, key: str, field: str, value: dict | str) -> None:
        """
        Set a field in a Redis hash.

        Args:
            key (str): The Redis hash key.
            field (str): The field to set in the hash.
            value (dict | str): The value to set (serialized as JSON if dict).

        Returns:
            None
        """
        try:
            if isinstance(value, dict):
                value = json.dumps(value)
            await self.redis.hset(key, field, value)
        except Exception as e:
            logger.exception("Failed to set hash field %s in key %s", field, key)
            raise e

    async def get_hash(self, key: str, field: str) -> dict | str | None:
        """
        Get a field from a Redis hash.

        Args:
            key (str): The Redis hash key.
            field (str): The field to retrieve.

        Returns:
            dict | str | None: The value of the field (deserialized if JSON), or None if the field does not exist.
        """
        value = await self.redis.hget(key, field)
        if value is not None:
            try:
                return json.loads(value)
            except json.JSONDecodeError:
                return value

        return None

    async def delete_hash_field(self, key: str, field: str) -> None:
        """
        Delete a field from a Redis hash.

        Args:
            key (str): The Redis hash key.
            field (str): The field to delete.

        Returns:
            None
        """
        await self.redis.hdel(key, field)

    async def whitelist_user(
        self, token: str, payload: dict, expire: int = None
    ) -> None:
        """
        Add a user to the whitelist using a Redis key with an expiration time.

        Args:
            token (str): The user's JWT token (used as the key).
            payload (dict): The JWT payload containing user details (name, surname, user_id, iat, expire).
            expire (int, optional): Expiration time for the whitelist entry in seconds.

        Returns:
            None
        """
        key = f"user_whitelist:{token}"
        value = json.dumps(payload)
        await self.redis.set(key, value, ex=expire)

    async def is_user_whitelisted(self, token: str) -> bool:
        """
        Check if a user is whitelisted.

        Args:
            token (str): The user's JWT token to check.

        Returns:
            bool: True if the user is whitelisted, False otherwise.
        """
        key = f"user_whitelist:{token}"
        return await self.redis.exists(key) > 0

    async def get_whitelist_payload(self, token: str) -> dict | None:
        """
        Get the JWT payload for a whitelisted user.

        Args:
            token (str): The user's JWT token to check.

        Returns:
            dict | None: The JWT payload if the user is whitelisted, or None if not.
        """
        key = f"user_whitelist:{token}"
        value = await self.redis.get(key)
        if value:
            return json.loads(value)

        return None

    async def remove_user_from_whitelist(self, token: str) -> None:
        """
        Remove a user from the whitelist.

        Args:
            token (str): The user's JWT token to remove.

        Returns:
            None
        """
        key = f"user_whitelist:{token}"
        await self.redis.delete(key)


redis_client = RedisClient()
