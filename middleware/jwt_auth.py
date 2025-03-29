"""
This module contains the JWTAuthBackend class, which is an authentication
backend that validates a JWT token provided either in the Authorization header
"""

import logging
from datetime import datetime, timezone

from starlette.authentication import AuthCredentials, AuthenticationBackend, SimpleUser
from starlette.requests import Request

from cache.redis import redis_client
from utils.utils import decode_jwt


class JWTAuthBackend(AuthenticationBackend):
    """
    Authentication backend that validates a JWT token provided either in the
    Authorization header (Bearer token) or as a cookie named 'access_token'.
    """

    async def authenticate(self, request: Request):
        """
        Authenticates the user by validating the JWT token in cookies.
        Routes decorated with @requires(['authenticated']) will be protected.

        Args:
            request (Request): The incoming HTTP request.

        Returns:
            tuple[AuthCredentials, SimpleUser] | None: Authentication credentials and user if valid, otherwise None.
        """
        token = request.cookies.get("access_token")

        if not token:
            logging.error("No access token found in cookies")
            return None

        payload = await decode_jwt(token)
        exp = payload.get("exp")
        if not exp or datetime.fromtimestamp(exp, tz=timezone.utc) < datetime.now(
            timezone.utc
        ):
            logging.error("JWT token is expired")
            return None
        is_whitelisted = await redis_client.is_user_whitelisted(token)
        if not is_whitelisted:
            logging.error("JWT token is not in the whitelist")
            return None
        user_id = payload.get("sub")
        if not user_id:
            logging.error("User ID is missing in the JWT payload")
            return None
        return AuthCredentials(["authenticated"]), SimpleUser(user_id)
