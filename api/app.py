"""Main FastAPI application file"""

from core.postgres_database import database
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from routers.auth import router as auth_router

app = FastAPI()
app.include_router(auth_router)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.on_event("startup")
async def on_startup():
    """Initialize the database tables on startup"""
    await database.init_db()


@app.get("/")
async def read_root():
    """Root endpoint"""
    return {"Hello": "World"}
