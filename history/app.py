"""
Main application file for the service.
"""

import logging.config

from fastapi import FastAPI
from starlette.middleware.authentication import AuthenticationMiddleware

from api.router import router
from auth.middleware import JWTAuthBackend

logging.config.fileConfig("/config/logging.ini", disable_existing_loggers=False)

app = FastAPI(root_path="/api/history")
app.include_router(router)

app.add_middleware(AuthenticationMiddleware, backend=JWTAuthBackend())
