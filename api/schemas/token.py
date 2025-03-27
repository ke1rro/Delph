"""Token Scheme"""

from datetime import datetime

from pydantic import BaseModel


class TokenInfo(BaseModel):
    """
    Token Scheme

    Args:
        BaseModel: Pydantic BaseModel
    """

    access_token: str
    token_type: str
    expires: datetime
