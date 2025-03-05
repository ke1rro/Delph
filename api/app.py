"""Main FastAPI application file"""

import asyncio

from fastapi import FastAPI

from db.models import init_models
from routers.auth import router as auth_router


app = FastAPI()
app.include_router(auth_router)


@app.on_event("startup")
async def on_startup():
    """Initialize the database tables on startup"""
    await init_models()


@app.get("/")
async def read_root():
    """Root endpoint"""
    return {"Hello": "World"}


if __name__ == "__main__":
    asyncio.run(on_startup())
