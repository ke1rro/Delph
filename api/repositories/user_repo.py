"""User repository module."""

from db.models import User
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select


class UserRepository:
    """User repository class, which contains methods for user data manipulation."""

    def __init__(self, db):
        """Initialize user repository."""
        self.db = db

    # Test method WILL be removed
    async def get_user_by_username(self, username: str, session: AsyncSession) -> User:
        """
        Get a user by username.

        Args:
            username (str): The username of the user.
        """
        user = await session.scalar(select(User).filter(User.name == username))
        return user
