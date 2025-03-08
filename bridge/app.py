"""
Main application file for the service.
"""

from fastapi import FastAPI

from api.dependencies import dependencies_lifespans
from api.posting import router as posting_router
from api.streaming import router as streaming_router

app = FastAPI(lifespan=dependencies_lifespans)
app.include_router(posting_router)
app.include_router(streaming_router)
