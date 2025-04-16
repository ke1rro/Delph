"""
This module contains the JWTAuthBackend class, which is an authentication
backend that validates a JWT token provided either in the Authorization header
"""

import logging
from datetime import datetime, timezone

from starlette.authentication import AuthCredentials, AuthenticationBackend, SimpleUser
from starlette.requests import Request

from auth.jwt import decode_jwt
from cache.redis import redis_client


class SimpleUser(SimpleUser):
    """
    Extended SimpleUser class to include additional attributes.
    """

    def __init__(
        self,
        username: str,
        user_id: str = None,
        user_surname: str = None,
        token: str = None,
    ):
        """
        Initialize the extended SimpleUser.

        Args:
            username (str): The username of the user.
            user_id (str): The unique identifier of the user.
            user_surname (str): The surname of the user.
        """
        super().__init__(username)
        self.token = token
        self.user_id = user_id
        self.user_surname = user_surname


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

        # jwt_payload
        # "sub": user.user_id.hex,
        # "user_id": user.user_id.hex,
        # "user_name": user.name,
        # "user_surname": user.surname,
        # "is_admin": user.is_admin,

        payload = await decode_jwt(token)
        exp = payload.get("exp")
        name = payload.get("user_name")
        surname = payload.get("user_surname")
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
        return AuthCredentials(["authenticated"]), SimpleUser(
            username=name, user_id=user_id, user_surname=surname, token=token
        )
