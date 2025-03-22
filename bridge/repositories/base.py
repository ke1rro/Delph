from abc import ABC, abstractmethod


class Repository(ABC):
    """
    Abstract base class for repositories.
    """

    async def __aenter__(self):
        await self.connect()
        return self

    async def __aexit__(self, *_):
        await self.disconnect()

    @abstractmethod
    async def connect(self):
        """
        Connect repository to the data source.
        """

    @abstractmethod
    async def disconnect(self):
        """
        Disconnect repository from the data source.
        """
