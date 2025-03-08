"""
User service for authentication and checking permissions.
"""

from schemas.message import Source
from shapely import Point

from models.user import User
from repositories.user import UserRepository


class AuthenticationError(Exception):
    """
    Invalid token was provided.
    """


class UserService:
    """
    User service to authenticate and check permissions.

    Args:
        repo: User repository.
        source_fmt: Source identifier format, which will be used by .format method with
            user_id keyword provided.
    """

    def __init__(self, repo: UserRepository, source_fmt: str):
        self.repo = repo
        self.source_fmt = source_fmt

    async def authenticate(self, token: str) -> User:
        """
        Authenticate the user by token.

        Args:
            token: User token.

        Returns:
            Authenticated user.

        Raises:
            AuthenticationError: If invalid token was provided.
        """
        user = await self.repo.get_user_by_token(token)
        if user is None:
            raise AuthenticationError

        return user

    async def create_source(self, user: User, comment: str | None = None) -> Source:
        """
        Create a source object for the user.

        Args:
            user: User object.
            comment: Comment for the message to add to the source. Defaults to None.

        Returns:
            Source object.
        """
        return Source(
            id=self.source_fmt.format(user_id=user.id), name=user.name, comment=comment
        )

    async def check_can_read(self, user: User, point: Point) -> bool:
        """
        Check if the user has read permissions for the given point.

        Args:
            user: User object.
            point: Point to check.

        Returns:
            True if the user has read permissions for the given point, False otherwise
        """
        for permission in user.permissions:
            if permission.shape.contains(point) and permission.can_read:
                return True

        return False

    async def check_can_write(self, user: User, point: Point) -> bool:
        """
        Check if the user has write permissions for the given point.

        Args:
            user: User object.
            point: Point to check.

        Returns:
            True if the user has write permissions for the given point, False otherwise
        """
        for permission in user.permissions:
            if permission.shape.contains(point) and permission.can_write:
                return True

        return False
