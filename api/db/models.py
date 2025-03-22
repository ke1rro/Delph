"""User models(PostgreSQL)"""

import uuid

from core.database import Base
from sqlalchemy import UUID, Integer, LargeBinary, String
from sqlalchemy.orm import Mapped, mapped_column


class User(Base):
    """
    Represents user in the system and an associated role.

    Args:
        id (int): The unique identifier for the user in database(primary key).
        user_id (uuid.UUID): A unique identifier for the user,
        stored as a UUID.
        name (str): The first name of the user.
        surname (str): The last name of the user.
        role_id (int): The identifier for the user's role,
        a foreign key to the `roles` table.
        role (Role): A relationship with the `Role` model,
        representing the user's assigned role.
    """

    __tablename__ = "users"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, autoincrement=True)
    user_id: Mapped[UUID] = mapped_column(
        UUID(as_uuid=True), unique=True, nullable=False, default=uuid.uuid4
    )
    name: Mapped[str] = mapped_column(String(64), nullable=False)
    surname: Mapped[str] = mapped_column(String(64), nullable=False)
    password: Mapped[bytes] = mapped_column(LargeBinary, nullable=False)
    is_admin: Mapped[bool] = mapped_column(Integer, nullable=False, default=0)
