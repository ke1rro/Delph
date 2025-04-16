"""Utils to work with JWT"""

from datetime import datetime, timedelta, timezone

import jwt
from fastapi import HTTPException
from logger import logger

from auth.config import settings

PR_KEY = settings.auth_jwt.private_key_path.read_text(encoding="utf-8")
PUB_KEY = settings.auth_jwt.public_key_path.read_text(encoding="utf-8")
ALGORITHM = settings.auth_jwt.algorithm
EXPIRES = settings.auth_jwt.access_token_expire


async def encode_jwt(
    payload: dict[str,],
    expires: int = EXPIRES,
    expire_timedelta: timedelta | None = None,
) -> tuple[str, int]:
    """
    Creates a JWT token.

    Args:
        payload (Dict[str, Any]): The data to encode into the JWT.
        key (str): The secret key used to sign the JWT.
        algorithm (str): The algorithm used to encode the JWT.

    Returns:
        str: The encoded JWT token and expire time.
    """
    to_encode = payload.copy()
    time_now = datetime.now(timezone.utc)
    if expire_timedelta:
        expires = time_now + expire_timedelta
    else:
        expires = time_now + timedelta(minutes=expires)
    to_encode.update(exp=expires, iat=time_now)
    return jwt.encode(to_encode, PR_KEY, ALGORITHM), expires


async def decode_jwt(
    token: str | bytes,
) -> dict[str,]:
    """
    Decodes a JWT token and verifies its validity.

    Args:
        token (str | bytes): The JWT token to decode.

    Returns:
        Dict[str, Any]: The decoded payload of the JWT.
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
        logger.exception("Token %s has expired", token)
        raise HTTPException(status_code=401, detail="Token has expired")
    except jwt.InvalidTokenError:
        logger.exception("Token %s is invalid", token)
        raise HTTPException(status_code=401, detail="Invalid token")
