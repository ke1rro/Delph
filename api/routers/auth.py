"""
Module provides user authentication via JWT
"""

import uuid
from typing import Any

from dependencies.auth import (
    create_jwt_token,
    get_user_service,
    validate_jwt_token,
    validate_user_auth,
)
from fastapi import APIRouter, Depends, HTTPException, Response, status
from fastapi.requests import Request
from fastapi.responses import JSONResponse
from services.user_service import UserService
from starlette.authentication import requires

from schemas.user import LoginResponse, UserLogin, UserReg

router = APIRouter(prefix="/auth", tags=["auth"])


@router.options("/{full_path:path}")
async def preflight(request: Request, full_path: str):
    """
    Handle CORS preflight requests.
    """
    headers = {
        "Access-Control-Allow-Origin": "http://localhost:3000",
        "Access-Control-Allow-Methods": "GET, POST, OPTIONS, PUT, DELETE",
        "Access-Control-Allow-Headers": "Content-Type, Authorization",
        "Access-Control-Allow-Credentials": "true",
    }

    return JSONResponse(content=request, headers=headers, status_code=204)


# Should not be used
# This used due to the fact the frontend do not have client side routing
# This will be removed once the frontend is updated
@router.get("/validate_token")
async def validate_token(payload=Depends(validate_jwt_token)) -> dict[str, Any]:
    """
    Validates a JWT token and returns the payload.

    Args:
        payload (_type_, optional): payload of the jwt token Defaults to Depends(validate_jwt_token).

    Returns:
        dics[str,]: payload of the jwt
    """
    return {
        "valid": True,
        "user_id": payload.get("sub"),
        "user_name": payload.get("user_name"),
        "user_sur_name": payload.get("user_sur_name"),
    }


@router.post("/login", response_model=LoginResponse)
async def auth_user(
    response: Response,
    user: UserLogin = Depends(validate_user_auth),
) -> LoginResponse:
    """
    Authenticates a user and returns a JWT token.
    Adds cookie to the response.
    """
    await create_jwt_token(user, response)
    return {
        "message": "Successfully logged in",
        "user_id": user.user_id.hex,
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


# Will be removed
@router.get("/user")
@requires(["authenticated"])
async def get_user(
    request: Request,
):
    """
    Test route will be removed.
    """
    return {"request": request.headers}


# Will be removed
@router.get("/check")
async def check(request: Request):
    """
    Test route will be removed.
    """
    return {"Hello": 200}
