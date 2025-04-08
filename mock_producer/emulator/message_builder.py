from abc import ABC, abstractmethod

from emulator.object import Object


class MessageBuilder(ABC):
    """
    Abstract base class for building messages based on object data.

    This class defines the interface for building messages.
    Subclasses should implement the `build` method to create specific
    message formats.
    """

    @abstractmethod
    def build(self, obj: Object, iteration: int) -> tuple[int, str | None] | None:
        """
        Build a message based on the object and iteration.

        Args:
            obj: The object to build the message for.
            iteration: The current iteration number.

        Returns:
            A tuple containing the ttl in milliseconds and the comment, or None if
            no message is built.
        """


class SimpleMessageBuilder(MessageBuilder):
    """
    Simple message builder that creates a message with a fixed TTL and comment.

    Attributes:
        ttl: The time-to-live (TTL) for the message in milliseconds.
        comment: A comment or description for the message.
    """

    ttl: int
    comment: str | None

    def __init__(self, ttl: int, comment: str | None = None):
        self.ttl = ttl
        self.comment = comment

    def build(self, obj: Object, iteration: int) -> tuple[int, str | None] | None:
        """
        Build a simple message with a fixed TTL and comment.

        Args:
            obj: The object to build the message for.
            iteration: The current iteration number.

        Returns:
            A tuple containing the ttl in milliseconds and the comment.
        """
        return self.ttl, self.comment
