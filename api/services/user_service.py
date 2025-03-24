"""User services module."""

import uuid

from db.models import User
from repositories.user_repo import UserRepository
from utils.utils import hash_password

from schemas.user import UserReg


class UserService:
    """User logic services."""

    def __init__(self, user_repository: UserRepository):
        """Constructor."""
        self.user_repository = user_repository

    async def get_user(self, user_id: uuid.UUID) -> User | None:
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

    async def create_user(self, user_data: UserReg) -> uuid.UUID:
        """
        Create a user.

        Args:
            user_data (UserReg): The user data to create Pydantic scheme.

        Returns:
            : The created user object - sqlachemy User model.
        """
        hashed_password = await hash_password(user_data.password)
        user_obj = User(
            **user_data.model_dump(exclude={"password"}), password=hashed_password
        )
        return await self.user_repository.write_user(user_obj)

    async def is_admin(self, user_id: uuid.UUID) -> bool:
        """
        Check if the user is an admin.

        Args:
            user_id (uuid.UUID): The user ID to check.

        Returns:
            bool: True if the user is an admin, False otherwise.
        """
        return await self.user_repository.is_admin(user_id)
