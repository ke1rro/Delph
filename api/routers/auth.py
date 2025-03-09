"""
Module for JWT authentication
"""

from core.postgres_database import database
from fastapi import APIRouter, Depends, Form, HTTPException, status
from fastapi.requests import Request
from fastapi.responses import JSONResponse
from repositories.user_repo import UserRepository
from schemas.token import TokenInfo
from schemas.user import UserLogin, UserReg
from services.user_service import UserService
from sqlalchemy.ext.asyncio import AsyncSession
from utils.utils import encode_jwt, validate_password

router = APIRouter(prefix="/auth", tags=["auth"])


@router.options("/{full_path:path}")
async def preflight(request: Request, full_path: str):
    """
    Handle CORS preflight requests.

    Args:
        request (Request): the request object sent by the client.
        full_path (str): the full path of the request.
    """
    headers = {
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
        "Access-Control-Allow-Headers": "Content-Type, Authorization",
    }
    return JSONResponse(content=None, headers=headers, status_code=204)


async def get_user_service(
    session: AsyncSession = Depends(database.get_session),
) -> UserService:
    """Dependency for UserService"""
    return UserService(UserRepository(session))


async def validate_user_auth(
    user_id: str = Form(),
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
    if not user_id:
        raise unauthed_exc

    user = await user_service.check_user(user_id)
    if not user:
        raise unauthed_exc

    if await validate_password(password, hashed_password=user.password):
        return user

    raise unauthed_exc


@router.post("/login", response_model=TokenInfo)
async def auth_user(
    user: UserLogin = Depends(validate_user_auth),
):
    """
    Authenticates a user and returns a JWT token.
    """
    jwt_payload = {
        "sub": user.id,
        "user_id": user.user_id.hex,
        "user_name": user.name,
        "user_surname": user.surname,
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
