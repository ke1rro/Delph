"""
Module provides user authentication via JWT
"""
from typing import Any
from dependencies.auth import (create_jwt_token, get_user_service,
                               validate_jwt_token, validate_user_auth)
from fastapi import APIRouter, Depends, HTTPException, Response, status
from fastapi.requests import Request
from fastapi.responses import JSONResponse
from schemas.token import TokenInfo
from schemas.user import UserLogin, UserReg
from services.user_service import UserService

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


@router.post("/login", response_model=TokenInfo)
async def auth_user(
    response: Response,
    user: UserLogin = Depends(validate_user_auth),
) -> TokenInfo:
    """
    Authenticates a user and returns a JWT token.
    Adds cookie to the response.
    """
    return await create_jwt_token(user, response)


@router.post("/logout")
async def logout(response: Response):
    """
    Logout the user by clearing cookies.
    """
    response.delete_cookie(key="access_token")

    return {"message": "Successfully logged out"}


@router.post("/signup", response_model=UserReg)
async def write_user(
    user_data: UserReg,
    user_service: UserService = Depends(get_user_service),
):
    """
    Register a new user.
    """
    existing_user = await user_service.check_if_already_exists(user_data)
    if existing_user:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Username already exists",
        )

    new_user = await user_service.create_user(user_data)
    return new_user
