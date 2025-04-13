"""
Base repository class.
"""


class Repository:
    """
    Abstract base class for repositories.
    """

    async def __aenter__(self):
        await self.connect()
        return self

    async def __aexit__(self, *_):
        await self.disconnect()

    async def connect(self):
        """
        Connect repository to the data source.
        """

    async def disconnect(self):
        """
        Disconnect repository from the data source.
        """
