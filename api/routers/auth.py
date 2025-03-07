"""
Module for JWT authentication
"""

from core.postgres_database import database
from fastapi import APIRouter, Depends, Form, HTTPException, status
from repositories.user_repo import UserRepository
from schemas.token import TokenInfo
from schemas.user import UserReg, UserSchema
from services.user_service import UserService
from sqlalchemy.ext.asyncio import AsyncSession
from utils.utils import encode_jwt, validate_password

router = APIRouter(prefix="/auth", tags=["auth"])


async def get_user_service(
    session: AsyncSession = Depends(database.get_session),
) -> UserService:
    """Dependency for UserService"""
    return UserService(UserRepository(session))


async def validate_user_auth(
    username: str = Form(),
    password: str = Form(),
    user_service: UserService = Depends(get_user_service),
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

    user = await user_service.get_user(username)
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


@router.post("/signup", response_model=UserReg)
async def write_user(
    user_data: UserReg,  # Pydantic model automatically parses the JSON body
    user_service: UserService = Depends(get_user_service),
):
    """
    Register a new user.
    """
    existing_user = await user_service.get_user(user_data.name)
    if existing_user:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Username already taken",
        )

    new_user = await user_service.create_user(user_data)
    return new_user
