"""User repository module."""

from db.models import User
from schemas.user import UserLogin, UserReg
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from utils.utils import hash_password


class UserRepository:
    """User repository class, which contains methods for user data manipulation."""

    def __init__(self, session: AsyncSession):
        """Initialize user repository with a database session."""
        self.session = session

    async def get_user_by_username(self, username: str) -> User | None:
        """
        Get a user by username.

        Args:
            username (str): The username of the user.

        Returns:
            User | None: The user object if found, None otherwise
        """
        return await self.session.scalar(select(User).filter(User.name == username))

    async def write_user(self, user: UserReg) -> User:
        """
        Write a user to the database.

        Args:
            user (UserReg): The user to write.

        Returns:
            User: The written user object.
        """
        hashed_password = await hash_password(user.password)
        user_obj = User(
            **user.model_dump(exclude={"password"}), password=hashed_password
        )
        self.session.add(user_obj)
        await self.session.commit()
        await self.session.refresh(user_obj)
        return user_obj
