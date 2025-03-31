"""
Permission schema.
"""

from dataclasses import dataclass

from shapely import Polygon


@dataclass
class Permission:
    """
    Permission schema.

    Args:
        shape: Shape of the region on which the permission applies.
        can_read: Whether the user can read messages.
        can_write: Whether the user can write messages.
    """

    shape: Polygon
    can_read: bool
    can_write: bool


@dataclass
class User:
    """
    User schema.

    Args:
        id: User ID.
        name: User name.
        permissions: List of permissions.
    """

    id: str
    name: str
    token: str
    permissions: list[Permission]
