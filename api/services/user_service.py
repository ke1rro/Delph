"""User services module."""

from db.models import User
from repositories.user_repo import UserRepository
from schemas.user import UserReg


class UserService:
    """User logic services."""

    def __init__(self, user_repository: UserRepository):
        """Constructor."""
        self.user_repository = user_repository

    async def get_user(self, user_name: str) -> User | None:
        """Get a user by username."""
        return await self.user_repository.get_user_by_username(user_name)

    async def create_user(self, user_data: UserReg) -> User:
        """Create a user."""
        return await self.user_repository.write_user(user_data)
