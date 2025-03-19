"""Database interface for the API."""

import os

from dotenv import load_dotenv
from sqlalchemy.ext.asyncio import AsyncAttrs
from sqlalchemy.orm import DeclarativeBase


class Base(AsyncAttrs, DeclarativeBase):
    """Base class for models instantiating"""
