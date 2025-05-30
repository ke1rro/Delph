"""
User service for authentication and checking permissions.
"""

from models.user import Permission, User
from repositories.user import UserRepository
from shapely import Point, Polygon

from schemas.message import Source


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

    async def validate_user(self, user: User) -> bool:
        """
        Validate user by token.

        Args:
            user: User object.

        Returns:
            bool: True if user is valid, False otherwise.
        """
        return await self.repo.is_token_valid(user.token)

    async def get_global_permission(self) -> Permission:
        """
        Get global permission for the user.

        Returns:
            Permission: Global permission object.
        """
        return Permission(
            shape=Polygon(
                [
                    Point(-180, -90),
                    Point(-180, 90),
                    Point(180, 90),
                    Point(180, -90),
                    Point(-180, -90),
                ]
            ),
            can_read=True,
            can_write=True,
        )

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
        Checks specific user permissions first, then falls back to global permission.

        Args:
            user: User object.
            point: Point to check (longitude, latitude).

        Returns:
            True if the user has read permissions for the given point, False otherwise
        """

        global_permission = await self.get_global_permission()
        if global_permission.shape.contains(point) and global_permission.can_read:
            return True

        return False

    async def check_can_write(self, user: User, point: Point) -> bool:
        """
        Check if the user has write permissions for the given point.
        Checks specific user permissions first, then falls back to global permission.

        Args:
            user: User object.
            point: Point to check (longitude, latitude).

        Returns:
            True if the user has write permissions for the given point, False otherwise
        """

        global_permission = await self.get_global_permission()
        if global_permission.shape.contains(point) and global_permission.can_write:
            return True

        return False
