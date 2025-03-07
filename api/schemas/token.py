"""Token Scheme"""

from pydantic import BaseModel


class TokenInfo(BaseModel):
    """
    Token Scheme

    Args:
        BaseModel: Pydantic BaseModel
    """

    access_token: str
    token_type: str
    expires_in: int = 300
