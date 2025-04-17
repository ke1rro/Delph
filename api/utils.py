"""Utils for API service"""

import asyncio

import bcrypt


async def hash_password(password: str) -> bytes:
    """
    Hashes a password using bcrypt.

    Args:
        password (str): The password to hash.

    Returns:
        bytes: The hashed password.
    """
    salt = bcrypt.gensalt()
    return await asyncio.to_thread(bcrypt.hashpw, password.encode(), salt)


async def validate_password(password: str, hashed_password: bytes) -> bool:
    """
    Validates a password against a hashed password.
    Args:
        password (str): a password to validate
        hashed_password (bytes): a hashed password to validate against

    Returns:
        bool: True if the password is valid, False otherwise.
    """
    return await asyncio.to_thread(bcrypt.checkpw, password.encode(), hashed_password)
