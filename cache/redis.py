"""
Redis client module for interacting with Redis hash tables.
"""

import json
import logging

from redis.asyncio import Redis

from shared_config.config import settings


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
            logging.error(
                f"Failed to set hash field: {field} in key: {key}. Error: {e}"
            )
            raise

    async def get_hash(self, key: str, field: str) -> dict | str | None:
        """
        Get a field from a Redis hash.

        Args:
            key (str): The Redis hash key.
            field (str): The field to retrieve.

        Returns:
            dict | str | None: The value of the field (deserialized if JSON), or None if the field does not exist.
        """
        try:
            value = await self.redis.hget(key, field)
            if value is not None:
                try:
                    return json.loads(value)
                except json.JSONDecodeError:
                    return value
            return None
        except Exception as e:
            logging.error(
                f"Failed to get hash field: {field} from key: {key}. Error: {e}"
            )
            raise

    async def delete_hash_field(self, key: str, field: str) -> None:
        """
        Delete a field from a Redis hash.

        Args:
            key (str): The Redis hash key.
            field (str): The field to delete.

        Returns:
            None
        """
        try:
            await self.redis.hdel(key, field)
        except Exception as e:
            logging.error(
                f"Failed to delete hash field: {field} from key: {key}. Error: {e}"
            )
            raise

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
        try:
            key = f"user_whitelist:{token}"
            value = json.dumps(payload)
            await self.redis.set(key, value, ex=expire)
        except Exception as e:
            logging.error(f"Failed to whitelist user with token {token}. Error: {e}")
            raise

    async def is_user_whitelisted(self, token: str) -> bool:
        """
        Check if a user is whitelisted.

        Args:
            token (str): The user's JWT token to check.

        Returns:
            bool: True if the user is whitelisted, False otherwise.
        """
        try:
            key = f"user_whitelist:{token}"
            return await self.redis.exists(key) > 0
        except Exception as e:
            logging.error(
                f"Failed to check whitelist status for token {token}. Error: {e}"
            )
            raise

    async def get_whitelist_payload(self, token: str) -> dict | None:
        """
        Get the JWT payload for a whitelisted user.

        Args:
            token (str): The user's JWT token to check.

        Returns:
            dict | None: The JWT payload if the user is whitelisted, or None if not.
        """
        try:
            key = f"user_whitelist:{token}"
            value = await self.redis.get(key)
            if value:
                return json.loads(value)
            return None
        except Exception as e:
            logging.error(
                f"Failed to get whitelist payload for token {token}. Error: {e}"
            )
            raise

    async def remove_user_from_whitelist(self, token: str) -> None:
        """
        Remove a user from the whitelist.

        Args:
            token (str): The user's JWT token to remove.

        Returns:
            None
        """
        try:
            key = f"user_whitelist:{token}"
            await self.redis.delete(key)
            logging.info(f"User with token {token} removed from whitelist")
        except Exception as e:
            logging.error(
                f"Failed to remove user with token {token} from whitelist. Error: {e}"
            )
            raise


redis_client = RedisClient()
