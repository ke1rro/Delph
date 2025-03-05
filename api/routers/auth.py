"""
Module for JWT authentication
"""

from fastapi import APIRouter, Depends, Form, HTTPException, status
from schemas.token import TokenInfo
from schemas.user import UserSchema
from utils.utils import encode_jwt, validate_password

from queries.users import get_user_by_username

router = APIRouter(prefix="/auth", tags=["auth"])


async def validate_user_auth(username: str = Form(), password: str = Form()) -> bool:
    """
    Validates a user's credentials.
    """
    unauthed_exc = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Invalid credentials",
    )
    if not username:
        raise unauthed_exc
    user = await get_user_by_username(username)
    if not user:
        raise unauthed_exc
    if validate_password(password, hashed_password=password):
        print("User authenticated")
        return user

    raise unauthed_exc


@router.post("/login", response_model=TokenInfo)
async def auth_user(
    user: UserSchema = Depends(validate_user_auth),
):
    """
    Authenticates a user and returns a JWT token.
    """
    jwt_payload = {
        # "sub": user.id,
        "username": user.name,
        # "email": user.email,
    }
    token = await encode_jwt(jwt_payload)
    print(token)
    return TokenInfo(access_token=token, token_type="Bearer", expires_in=300)
