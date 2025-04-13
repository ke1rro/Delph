"""
Main application file for the service.
"""

from fastapi import FastAPI
from middleware.jwt_auth import JWTAuthBackend
from starlette.middleware.authentication import AuthenticationMiddleware

from api.router import router

app = FastAPI(root_path="/api/history")
app.include_router(router)

app.add_middleware(AuthenticationMiddleware, backend=JWTAuthBackend())
