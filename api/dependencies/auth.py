"""
Module provides dependencies for the authentication.
"""

from datetime import datetime, timezone

from core.postgres_database import database
from fastapi import Depends, HTTPException, Response, status
from logger import logger
from pydantic import BaseModel
from repositories.user_repo import UserRepository
from services.user_service import UserService
from sqlalchemy.ext.asyncio import AsyncSession
from utils import validate_password

from auth.jwt import encode_jwt
from schemas.token import TokenInfo
from schemas.user import UserLogin


class LoginData(BaseModel):
    """
    Schema for login data.
    """

    user_id: str
    password: str


async def get_user_service(
    session: AsyncSession = Depends(database.get_session),
) -> UserService:
    """
    Returns the UserService instance

    Args:
        session (AsyncSession, optional): The database session do not path anyting!
        Defaults to Depends(database.get_session).

    Returns:
        UserService: The UserService instance
    """
    return UserService(UserRepository(session))


async def validate_user_auth(
    login_data: LoginData,
    user_service: UserService = Depends(get_user_service),
) -> bool:
    """


    Args:
        login_data (LogingData): The login data.
        user_service (UserService, optional): The UserService instance.

    Raises:
        unauthed_exc: If the user_id is not provided or the user is not found.

    Returns:
        bool: True if the password is valid, False otherwise.
    """
    unauthed_exc = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Invalid credentials",
    )
    if not login_data.user_id:
        logger.warning("User ID is not provided")
        raise unauthed_exc

    user = await user_service.get_user(login_data.user_id)
    if not user:
        logger.warning("Invalid user ID: %s", login_data.user_id)
        raise unauthed_exc

    if not await validate_password(login_data.password, hashed_password=user.password):
        logger.warning("Invalid password for user ID: %s", login_data.user_id)
        raise unauthed_exc

    logger.info("User ID %s authenticated successfully", login_data.user_id)
    return UserLogin(
        user_id=user.user_id.hex,
        name=user.name,
        surname=user.surname,
        is_admin=user.is_admin,
        password=user.password,
    )


async def create_jwt_token(user: UserLogin, response: Response) -> TokenInfo:
    """
    Create a JWT token and set it in the response cookie.

    Args:
        user (UserLogin): The user to create the token for.
        response (Response): The response

    Returns:
        TokenInfo: The token info schema.
    """
    jwt_payload = {
        "sub": user.user_id.hex,
        "user_id": user.user_id.hex,
        "user_name": user.name,
        "user_surname": user.surname,
        "is_admin": user.is_admin,
    }

    token, expires = await encode_jwt(jwt_payload)

    response.set_cookie(
        key="access_token",
        value=token,
        httponly=True,
        secure=True,
        samesite=None,
        max_age=int((expires - datetime.now(timezone.utc)).total_seconds()),
        expires=expires,
    )

    return TokenInfo(access_token=token, token_type="Bearer", expires=expires)
