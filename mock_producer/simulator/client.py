from abc import ABC, abstractmethod


class Client(ABC):
    """
    Abstract base class for a client that interacts with a server.
    """

    @abstractmethod
    def push(self, message: dict) -> str:
        """
        Push a message to the server.

        Args:
            message: The message to be pushed.

        Returns:
            The ID of the pushed message.
        """
