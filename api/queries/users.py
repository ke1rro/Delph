"""Module for users queries."""

from sqlalchemy import select
from db.models import User
from db.models import SessionLocal


async def get_user_by_username(name: str):
    """
    Get a user by username.

    Args:
        username (str): _description_
    """

    async with SessionLocal() as session:
        user = await session.scalar(select(User).filter(User.name == name))
        return user
