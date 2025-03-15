"""User services module."""

import uuid

from db.models import User
from repositories.user_repo import UserRepository
from schemas.user import UserReg


class UserService:
    """User logic services."""

    def __init__(self, user_repository: UserRepository):
        """Constructor."""
        self.user_repository = user_repository

    async def check_user(self, user_id: uuid.UUID.hex) -> User | None:
        """
        Get the user by his id.

        Args:
            user_id (uuid.UUID.hex): The id of the user stored in the database

        Returns:
            User | None: Returns the user object if exists otherwise None
        """
        return await self.user_repository.get_user_by_id(user_id)

    async def check_if_already_exists(self, user_data: UserReg) -> bool:
        """
        Check if the user already exists.

        Args:
            user_id (uuid.UUID.hex): The id of the user stored in the database

        Returns:
            bool: The user if exists, None otherwise.
        """
        return await self.user_repository.check_if_user_exists(user_data)

    async def create_user(self, user_data: UserReg) -> User:
        """
        Create a user.

        Args:
            user_data (UserReg): The user data to create Pydantic scheme.

        Returns:
            User: The created user object - sqlachemy User model.
        """
        return await self.user_repository.write_user(user_data)
