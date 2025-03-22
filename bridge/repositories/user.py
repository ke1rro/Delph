"""
User repository to interact with the database.
"""

from models.user import Permission, User
from shapely import Point, Polygon


# TODO: Currently stub user repository, needs to be implemented.
class UserRepository:
    def __init__(self):
        pass

    async def connect(self):
        pass

    async def disconnect(self):
        pass

    async def get_user_by_token(self, token: str) -> User | None:
        """
        Get a user by token.

        Args:
            token: Token to get the user.

        Returns:
            User object if the token is valid, None otherwise.
        """
        if token == "valid":
            return User(
                "user_test",
                "Test user",
                [
                    Permission(
                        shape=Polygon(
                            [
                                Point(0, 0),
                                Point(0, 1),
                                Point(1, 1),
                                Point(1, 0),
                                Point(0, 0),
                            ]
                        ),
                        can_read=True,
                        can_write=True,
                    ),
                    Permission(
                        shape=Polygon(
                            [
                                Point(1, 1),
                                Point(1, 2),
                                Point(2, 2),
                                Point(2, 1),
                                Point(1, 1),
                            ]
                        ),
                        can_read=True,
                        can_write=False,
                    ),
                ],
            )
        else:
            return None
