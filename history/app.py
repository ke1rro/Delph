"""
Main application file for the service.
"""

from fastapi import FastAPI
from starlette.middleware.authentication import AuthenticationMiddleware

from api.dependencies import dependencies_lifespans
from api.router import router
from middleware.jwt_auth import JWTAuthBackend

app = FastAPI(root_path="/api/bridge", lifespan=dependencies_lifespans)
app.include_router(router)

app.add_middleware(AuthenticationMiddleware, backend=JWTAuthBackend())
