"""
Module provides user blacklisting functionality via Redis.
"""

from fastapi import APIRouter, HTTPException, Request, status
from logger import logger
from starlette.authentication import requires

from auth.redis import redis_client
from schemas.user import BlacklistUserRequest

router = APIRouter(prefix="/blacklist", tags=["blacklist"])


# @router.post("/blacklist_user")
@requires(["admin", "authenticated"])
async def blacklist_user(body: BlacklistUserRequest):
    """
    Blacklist a user by their ID.

    Args:
        body (BlacklistUserRequest): The request body containing user_id, reason, and optional
                                     expire.

    Returns:
        dict: A success message.
    """
    logger.info("Blacklisting user %s for reason: %s", body.user_id, body.reason)
    try:
        await redis_client.blacklist_user(str(body.user_id), body.reason, body.expire)
        return {"message": f"User {body.user_id} successfully blacklisted"}
    except Exception as e:
        logger.exception("Failed to blacklist user %s", body.user_id)
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to blacklist user",
        ) from e


# @router.delete("/remove_user_from_blacklist")
@requires(["admin", "authenticated"])
async def remove_user_from_blacklist(user_id: str):
    """
    Remove a user from the blacklist.

    Args:
        user_id (str): The user ID to remove.

    Returns:
        dict: A success message.
    """
    logger.info("Removing user %s from blacklist", user_id)
    try:
        await redis_client.remove_user_from_blacklist(user_id)
        return {"message": f"User {user_id} successfully removed from blacklist"}
    except Exception as e:
        logger.exception("Failed to remove user %s from blacklist", user_id)
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to remove user from blacklist",
        ) from e
