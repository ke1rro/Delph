"""Utils to work with JWT"""

import asyncio
from datetime import datetime, timedelta, timezone

import bcrypt
import jwt
from core.config import settings
from fastapi import HTTPException

PR_KEY = settings.auth_jwt.private_key_path.read_text()
PUB_KEY = settings.auth_jwt.public_key_path.read_text()
ALGORITHM = settings.auth_jwt.algorithm
EXPIRES = settings.auth_jwt.access_token_expire


async def encode_jwt(
    payload: dict[str,],
    expires: int = EXPIRES,
    expire_timedelta: timedelta | None = None,
) -> str:
    """
    Creates a JWT token.

    Args:
        payload (Dict[str, Any]): The data to encode into the JWT.
        key (str): The secret key used to sign the JWT.
        algorithm (str): The algorithm used to encode the JWT.

    Returns:
        str: The encoded JWT token.
    """
    to_encode = payload.copy()
    time_now = datetime.now(timezone.utc)
    if expire_timedelta:
        expires = time_now + expire_timedelta
    else:
        expires = time_now + timedelta(minutes=expires)
    to_encode.update(exp=expires, iat=time_now)
    return jwt.encode(to_encode, PR_KEY, ALGORITHM)


async def decode_jwt(
    token: str | bytes,
) -> dict[str,]:
    """
    Decodes a JWT token and verifies its validity.

    Args:
        token (str | bytes): The JWT token to decode.

    Returns:
        Dict[str, Any]: The decoded payload of the JWT.

    Raises:
        jwt.ExpiredSignatureError: If the token has expired.
        jwt.InvalidTokenError: If the token is invalid.
    """
    try:
        payload = jwt.decode(
            token,
            PUB_KEY,
            algorithms=[ALGORITHM],
            options={"require": ["exp", "iat"]},
        )
        return payload
    except jwt.ExpiredSignatureError:
        raise HTTPException(status_code=401, detail="Token has expired")
    except jwt.InvalidTokenError as e:
        raise HTTPException(status_code=401, detail=f"Invalid token: {str(e)}")


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
