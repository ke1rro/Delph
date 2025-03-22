"""
This module contains the JWTAuthBackend class, which is an authentication
backend that validates a JWT token provided either in the Authorization header
"""

import logging

from core.postgres_database import database
from core.redis import redis_client
from repositories.user_repo import UserRepository
from services.user_service import UserService
from starlette.authentication import (AuthCredentials, AuthenticationBackend,
                                      SimpleUser)
from starlette.requests import Request
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
            return None

        payload = await decode_jwt(token)
        user_id = payload.get("sub")
        if await redis_client.is_user_blacklisted(user_id):
            logging.error(f"User {user_id} is blacklisted")
            return None

        async with database.session_factory() as session:
            is_admin = await UserService(UserRepository(session)).is_admin(user_id)

        if is_admin:
            logging.info(f"Admin user {user_id} authenticated")
            return AuthCredentials(["admin", "authenticated"]), SimpleUser(user_id)
        logging.info(f"User {user_id} authenticated")
        return AuthCredentials(["authenticated"]), SimpleUser(user_id)
