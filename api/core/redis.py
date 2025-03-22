"""
Redis client module for interacting with Redis hash tables.
"""

import json
import logging

from core.config import settings
from redis.asyncio import Redis


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

    async def blacklist_user(
        self, user_id: str, reason: str, expire: int = None
    ) -> None:
        """
        Add a user to the blacklist using a Redis hash.

        Args:
            user_id (str): The user ID to blacklist.
            reason (str): The reason for blacklisting.
            expire (int, optional): Expiration time for the blacklist entry in seconds.

        Returns:
            None
        """
        try:
            key = "user_blacklist"
            value = {"reason": reason}
            await self.set_hash(key, user_id, value)
            if expire:
                await self.redis.expire(key, expire)
        except Exception as e:
            logging.error(f"Failed to blacklist user {user_id}. Error: {e}")
            raise

    async def is_user_blacklisted(self, user_id: str) -> bool:
        """
        Check if a user is blacklisted.

        Args:
            user_id (str): The user ID to check.

        Returns:
            bool: True if the user is blacklisted, False otherwise.
        """
        try:
            key = "user_blacklist"
            return await self.redis.hexists(key, user_id)
        except Exception as e:
            logging.error(
                f"Failed to check blacklist status for user {user_id}. Error: {e}"
            )
            raise

    async def get_blacklist_reason(self, user_id: str) -> str | None:
        """
        Get the reason why a user is blacklisted.

        Args:
            user_id (str): The user ID to check.

        Returns:
            str | None: The reason for blacklisting, or None if the user is not blacklisted.
        """
        try:
            key = "user_blacklist"
            data = await self.get_hash(key, user_id)
            if isinstance(data, dict):
                return data.get("reason")
            return None
        except Exception as e:
            logging.error(
                f"Failed to get blacklist reason for user {user_id}. Error: {e}"
            )
            raise

    async def remove_user_from_blacklist(self, user_id: str) -> None:
        """
        Remove a user from the blacklist.

        Args:
            user_id (str): The user ID to remove.

        Returns:
            None
        """
        try:
            key = "user_blacklist"
            await self.delete_hash_field(key, user_id)
            logging.info(f"User {user_id} removed from blacklist")
        except Exception as e:
            logging.error(f"Failed to remove user {user_id} from blacklist. Error: {e}")
            raise


redis_client = RedisClient()
