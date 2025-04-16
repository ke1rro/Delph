"""
Main application file for the service.
"""

from fastapi import FastAPI
from starlette.middleware.authentication import AuthenticationMiddleware

from api.router import router
from auth.middleware import JWTAuthBackend

app = FastAPI(root_path="/api/history")
app.include_router(router)

app.add_middleware(AuthenticationMiddleware, backend=JWTAuthBackend())
