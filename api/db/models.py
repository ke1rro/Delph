"""User models(PostgreSQL)"""

import enum
import uuid

from core.database import Base
from sqlalchemy import UUID, Enum, ForeignKey, Integer, LargeBinary, String
from sqlalchemy.orm import Mapped, mapped_column, relationship


class PermissionAction(enum.Enum):
    """
    Defines the constants values for user's basic actions
    """

    READ = "read"
    WRITE = "write"
    DELETE = "delete"


class ResourceType(enum.Enum):
    """
    Defines the constants of resource user can interact with via
    permissions.
    """

    REPORT = "report"


class Role(Base):
    """
    Represents a role in the system with a unique identifier and a name.

    Args:
        id (int): The unique identifier for the role (primary key).
        name (str): The name of the role, must be unique and not null.
        permissions (list): A many-to-many
        relationship with the `Permission` model,
        representing the permissions associated with the role.
    """

    __tablename__ = "roles"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, autoincrement=True)
    name: Mapped[str] = mapped_column(String(50), unique=True, nullable=False)

    permissions: Mapped["Permission"] = relationship(
        "Permission", secondary="role_permissions", back_populates="roles"
    )


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
    # role_id: Mapped[int] = mapped_column(
    #     Integer, ForeignKey("roles.id"), nullable=True
    # )
    password: Mapped[bytes] = mapped_column(LargeBinary, nullable=False)
    # role: Mapped[Role] = relationship("Role")


class Permission(Base):
    """
    Represents a permission that defines an allowed action on a specific resource.

    Args:
        id (int): The unique identifier for the permission (primary key).
        action (PermissionAction): The type of action allowed, such as "read", "write", or "delete".
        resource (ResourceType): The resource on which the action is performed,
        such as "user", "mission", or "report".
        roles (list[Role]): A many-to-many relationship with the `Role` model,
                            representing roles that have this permission.
    """

    __tablename__ = "permissions"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, autoincrement=True)
    action: Mapped[PermissionAction] = mapped_column(
        Enum(PermissionAction), nullable=False
    )
    resource: Mapped[ResourceType] = mapped_column(Enum(ResourceType), nullable=False)

    roles: Mapped[list["Role"]] = relationship(
        "Role", secondary="role_permissions", back_populates="permissions"
    )


class RolePermission(Base):
    """
    Represents the association between roles and permissions in a many-to-many relationship.

    This table links the `roles` and `permissions` tables, defining which roles have
    access to specific permissions.

    Args:
        id (int): The unique identifier for the role-permission association (primary key).
        role_id (int): The foreign key referencing the `roles` table.
        permission_id (int): The foreign key referencing the `permissions` table.
    """

    __tablename__ = "role_permissions"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, autoincrement=True)
    role_id: Mapped[int] = mapped_column(ForeignKey("roles.id"), nullable=False)
    permission_id: Mapped[int] = mapped_column(
        ForeignKey("permissions.id"), nullable=False
    )
