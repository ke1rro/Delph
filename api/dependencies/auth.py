"""
Module provides dependencies for the authentication.
"""

from datetime import datetime, timezone
from typing import Any

from core.postgres_database import database
from fastapi import Depends, HTTPException, Request, Response, status
from pydantic import BaseModel
from repositories.user_repo import UserRepository
from services.user_service import UserService
from sqlalchemy.ext.asyncio import AsyncSession

from schemas.token import TokenInfo
from schemas.user import UserLogin
from utils.utils import decode_jwt, encode_jwt, validate_password


class LogingData(BaseModel):
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
    login_data: LogingData,
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
        raise unauthed_exc

    user = await user_service.get_user(login_data.user_id)
    if not user:
        raise unauthed_exc

    if await validate_password(login_data.password, hashed_password=user.password):
        return UserLogin(
            user_id=user.user_id.hex,
            name=user.name,
            surname=user.surname,
            is_admin=user.is_admin,
            password=user.password,
        )

    raise unauthed_exc


async def validate_jwt_token(
    request: Request, user_service: UserService = Depends(get_user_service)
) -> dict[str, Any]:
    """
    Validates the JWT token from the request.
    Returns the decoded JWT payload if valid.

    Args:
        request (Request): The request object.
        user_service (UserService, optional): The UserService instance.

    Raises:
        HTTPException: If the token is missing or invalid.

    Returns:
        dict[str, Any]: The decoded JWT payload.
    """

    token = request.cookies.get("access_token")

    if not token:
        raise HTTPException(status_code=401, detail="Missing access token")

    try:
        payload = await decode_jwt(token)
        user = await user_service.get_user(payload["sub"])

        if not user:
            raise HTTPException(status_code=401, detail="Invalid token")

        return payload
    except Exception:
        raise HTTPException(status_code=401, detail="Invalid or expired token")


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
