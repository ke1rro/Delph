import requests
from simulator.client import Client


class HttpClient(Client):
    """
    A class to handle the connection to the server and push messages.

    Attributes:
        session: The requests session used for HTTP requests.
        url: The base URL of the server.
        connected: A boolean indicating if the client is connected to the server.
    """

    session: requests.Session
    url: str
    connected: bool

    def __init__(self, url: str):
        self.session = requests.Session()
        self.url = url.removesuffix("/")
        self.connected = False

    def __enter__(self) -> "HttpClient":
        """
        Enter the runtime context related to this object.

        Returns:
            The instance of the Client class (self).
        """
        return self

    def __exit__(self, *args):
        """
        Exit the runtime context related to this object.
        Disconnects from the server if connected.
        """
        self.disconnect()

    def connect(self, user_id: str, password: str) -> "HttpClient":
        """
        Connect to the server and authenticate the user.

        Args:
            user_id: The user ID for authentication.
            password: The password for authentication.

        Returns:
            The instance of the Client class (self).
        """
        if self.connected:
            return

        response = self.session.post(
            self.url + "/api/core/auth/login",
            json={"user_id": user_id, "password": password},
        )
        response.raise_for_status()
        self.connected = True
        return self

    @property
    def _cookies(self):
        return {
            "access_token": self.session.cookies.get("access_token"),
        }

    def disconnect(self):
        """
        Disconnect from the server and close the session.
        """
        if not self.connected:
            return

        response = self.session.post(
            self.url + "/api/core/auth/logout",
            cookies=self._cookies,
        )
        response.raise_for_status()
        self.connected = False
        self.session.close()

    def push(self, message: dict) -> str:
        """
        Push a message to the server.

        Args:
            message: The message to be pushed.

        Returns:
            The ID of the pushed message.
        """
        if not self.connected:
            raise RuntimeError("Client is not connected. Call connect() first.")

        response = self.session.put(
            self.url + "/api/bridge/messages",
            json=message,
            cookies=self._cookies,
        )
        response.raise_for_status()
        return response.json()["id"]
