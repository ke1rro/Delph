"""Main FastAPI application file"""

from contextlib import asynccontextmanager

from core.postgres_database import database
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from middleware.jwt_auth import JWTAuthBackend
from routers.auth import router as auth_router
from starlette.middleware.authentication import AuthenticationMiddleware


@asynccontextmanager
async def lifespan(_):
    """Initialize the database tables on startup"""
    await database.init_db()
    yield


app = FastAPI(lifespan=lifespan)
app.include_router(auth_router)
app.add_middleware(AuthenticationMiddleware, backend=JWTAuthBackend())

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["GET", "POST", "OPTIONS", "PUT", "DELETE"],
    allow_headers=["Content-Type", "Authorization"],
    expose_headers=["Set-Cookie"],
)
