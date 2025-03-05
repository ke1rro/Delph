"""Users Schemas"""

from pydantic import BaseModel, ConfigDict, EmailStr


class UserSchema(BaseModel):
    model_config = ConfigDict(strict=True)

    username: str
    password: bytes
    email: EmailStr | None = None
