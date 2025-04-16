"""Main FastAPI application file"""

from contextlib import asynccontextmanager

from core.postgres_database import database
from fastapi import FastAPI
from routers.auth import router as auth_router
from starlette.middleware.authentication import AuthenticationMiddleware

from auth.middleware import JWTAuthBackend


@asynccontextmanager
async def lifespan(_):
    """Initialize the database tables on startup"""
    await database.init_db()
    yield


app = FastAPI(root_path="/api/core", lifespan=lifespan)

app.add_middleware(AuthenticationMiddleware, backend=JWTAuthBackend())

app.include_router(auth_router)

# app.add_middleware(
#     CORSMiddleware,
#     allow_origins=[settings.cors.cors_allow_origin],
#     allow_credentials=True,
#     allow_methods=["GET", "POST", "OPTIONS", "PUT", "DELETE"],
#     allow_headers=["Content-Type", "Authorization"],
#     expose_headers=["Set-Cookie"],
# )
