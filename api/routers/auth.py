"""
Module for JWT authentication
"""

from core.postgres_database import database
from fastapi import APIRouter, Depends, Form, HTTPException, status
from schemas.token import TokenInfo
from schemas.user import UserSchema
from sqlalchemy.ext.asyncio import AsyncSession
from utils.utils import encode_jwt, validate_password

router = APIRouter(prefix="/auth", tags=["auth"])


async def validate_user_auth(
    username: str = Form(),
    password: str = Form(),
    session: AsyncSession = Depends(database.get_session),
) -> bool:
    """
    Validates a user's credentials.
    """
    unauthed_exc = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Invalid credentials",
    )
    if not username:
        raise unauthed_exc

    user = await database.user_repo.get_user_by_username(username, session)
    if not user:
        raise unauthed_exc

    if validate_password(password, hashed_password=password):
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
    return TokenInfo(access_token=token, token_type="Bearer", expires_in=300)
