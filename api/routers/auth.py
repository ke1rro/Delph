"""
Module provides user authentication via JWT
"""

import uuid
from datetime import datetime, timezone
from typing import Any

from dependencies.auth import (
    create_jwt_token,
    get_user_service,
    validate_jwt_token,
    validate_user_auth,
)
from fastapi import APIRouter, Depends, HTTPException, Response, status
from fastapi.requests import Request
from services.user_service import UserService
from starlette.authentication import requires

from auth.redis import redis_client
from schemas.user import LoginResponse, UserLogin, UserReg

router = APIRouter(prefix="/auth", tags=["auth"])


@router.get("/me")
@requires(["authenticated"])
async def validate_token(
    request: Request, payload=Depends(validate_jwt_token)
) -> dict[str, Any]:
    """
    Represents a simple endpoint to validate the JWT token.

    Args:
        payload (validate_jwt_token): payload of the jwt token Defaults to Depends(validate_jwt_token).

    Returns:
        dics[str,]: User information if validation is valid.
    """
    user = request.user
    return {
        "user_id": str(user.user_id),
        "user_name": user.username,
        "user_surname": user.user_surname,
    }


@router.post("/login", response_model=LoginResponse)
async def auth_user(
    request: Request,
    response: Response,
    user: UserLogin = Depends(validate_user_auth),
) -> LoginResponse:
    """
    Authenticates a user and returns a JWT token.
    Adds cookie to the response.
    """
    existing_token = request.cookies.get("access_token")
    if existing_token:
        is_whitelisted = await redis_client.is_user_whitelisted(existing_token)
        if is_whitelisted:
            return {
                "message": "Successfully logged in",
                "user_id": user.user_id,
                "user_name": user.name,
                "user_surname": user.surname,
            }

    token = await create_jwt_token(user, response)
    user_data = user.model_dump(exclude={"password"})
    user_data["user_id"] = str(user_data["user_id"])
    expire_seconds = int((token.expires - datetime.now(timezone.utc)).total_seconds())
    await redis_client.whitelist_user(
        token=token.access_token, payload=user_data, expire=expire_seconds
    )
    return {
        "message": "Successfully logged in",
        "user_id": user.user_id,
        "user_name": user.name,
        "user_surname": user.surname,
    }


@router.post("/logout")
async def logout(response: Response) -> dict[str, str]:
    """
    Logout the user by clearing cookies.
    """
    response.delete_cookie(key="access_token")

    return {"message": "Successfully logged out"}


@router.post("/signup", response_model=uuid.UUID)
async def write_user(
    user_data: UserReg,
    user_service: UserService = Depends(get_user_service),
) -> uuid.UUID:
    """
    Register a new user.
    """
    existing_user = await user_service.check_if_already_exists(user_data)
    if existing_user:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="User already exists",
        )

    new_user_id = await user_service.create_user(user_data)
    return new_user_id
