"""
Main application file for the service.
"""

from fastapi import FastAPI
from starlette.middleware.authentication import AuthenticationMiddleware

from api.dependencies import dependencies_lifespans
from api.posting import router as posting_router
from api.streaming import router as streaming_router
from middleware.jwt_auth import JWTAuthBackend

app = FastAPI(root_path="/api/bridge", lifespan=dependencies_lifespans)
app.include_router(posting_router)
app.include_router(streaming_router)

app.add_middleware(AuthenticationMiddleware, backend=JWTAuthBackend())
