"""Users Schemas"""

import string
import uuid

from pydantic import BaseModel, ConfigDict, Field, constr, field_validator


class UserSchema(BaseModel):
    """
    User Schema for login

    Args:
        user_id (uuid.uuid4): The user's id
    """

    model_config = ConfigDict(from_attributes=True)

    user_id: uuid.UUID


class LoginResponse(UserSchema):
    """
    User Schema for login response
    """

    message: str


class UserReg(BaseModel):
    """
    User Schema for registration

    Args:
        name (str): The user's name
        surname (str): The user's surname
        password (str): The user's password
    """

    name: str = Field(min_length=3, max_length=64)
    surname: str = Field(min_length=3, max_length=64)
    password: str = constr(min_length=8, max_length=128)

    @field_validator("password")
    @classmethod
    def validate(cls, value: str) -> str | ValueError:
        """
        Checks for valid password.

        Args:
            value (str): password to check.

        Returns:
            str | ValueError: Password if valid, Valuerror OtherWise
        """

        if not any(char.isupper() for char in value):
            raise ValueError("Password must contain at least one upper character.")

        if not any(char.isdigit() for char in value):
            raise ValueError("Password must contain at leat one digit.")

        if not any(char in string.punctuation for char in value):
            raise ValueError("Password must contain at leat one special symbol.")

        return value


class UserLogin(UserSchema):
    """
    User Schema for login

    Args:
        password (str): The user's password
    """

    password: str
    name: str
    surname: str
    is_admin: bool = False


class BlacklistUserRequest(UserSchema):
    """
    Blacklist User Request Schema
    """

    reason: str
    expire: int | None = None
