"""User repository module."""

import uuid

from db.models import User
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from sqlalchemy.orm import validates

from schemas.user import UserReg


class UserRepository:
    """User repository class, which contains methods for user data manipulation."""

    def __init__(self, session: AsyncSession):
        """Initialize user repository with a database session."""
        self.session = session

    @validates("users_id")
    def validate_user_id(self, value: uuid.UUID) -> uuid.UUID | ValueError:
        """
        Checks if the UUID is valid 16byte string

        Args:
            value (uuid.UUID): possible user's uuid

        Returns:
            uuid.UUID | ValueError: returns the same uuid or ValueError if it is wrong
        """
        try:
            return uuid.UUID(value)
        except ValueError as e:
            raise ValueError(f"invalid UUID: {value}") from e

    async def get_user_by_id(self, user_id: uuid.UUID) -> User | None:
        """
        Get a user by user id,
        the id is generated by uuid and works as unique indetifier for user.

        Args:
            username (str): The id of the user.

        Returns:
            User | None: The user object if found, None otherwise
        """
        try:
            user_id = self.validate_user_id(user_id)
            result = await self.session.scalars(
                select(User).where(User.user_id == user_id)
            )
            return result.one_or_none()
        except ValueError:
            return None

    async def write_user(self, user_obj: User) -> uuid.UUID:
        """
        Write a user to the database.

        Args:
            user (UserReg): The user to write.

        Returns:
            uuid.UUID: The user id.
        """
        self.session.add(user_obj)
        await self.session.commit()
        await self.session.refresh(user_obj)
        return user_obj.user_id

    async def check_if_user_exists(self, user_data: UserReg):
        """
        Check if the user already exists.

        Args:
            user_data (UserReg): The user data to check.

        Returns:
            bool: True if user exists, False otherwise.
        """
        user = await self.session.scalars(
            select(User).where(
                User.name == user_data.name, User.surname == user_data.surname
            )
        )
        return user.one_or_none()
