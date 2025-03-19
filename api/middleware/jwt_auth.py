import logging

from services.cache_service import CacheService
from services.user_service import UserService
from starlette.authentication import (AuthCredentials, AuthenticationBackend,
                                      SimpleUser)
from starlette.requests import Request
from utils.utils import decode_jwt


class JWTAuthBackend(AuthenticationBackend):
    """
    Authentication backend that validates a JWT token provided either in the
    Authorization header (Bearer token) or as a cookie named 'token'.
    """

    def __init__(self, get_user_service: UserService):
        self.get_user_service: UserService = get_user_service
        self.cache_service = CacheService()

    async def authenticate(self, request: Request):
        """
        Authenticates the user by validating the JWT token in cookies.
        Routes decorated with @requires(['authenticated']) will be protected.
        """
        token = request.cookies.get("access_token")

        if not token:
            return None

        if await self.cache_service.is_token_blacklisted(token):
            logging.warning("Token is blacklisted")
            return None
        try:
            # TODO fix issues with thread blocking
            payload = await decode_jwt(token)
            user_id = payload.get("sub")

            return AuthCredentials(["authenticated"]), SimpleUser(user_id)
        except Exception:
            return None
