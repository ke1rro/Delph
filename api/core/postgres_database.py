"""Module for PostgreSQL database implementation"""

from typing import AsyncIterator

from core.config import settings
from core.database import Base
from sqlalchemy.ext.asyncio import async_sessionmaker, create_async_engine


class PostgresDatabase:
    """PostgreSQL database implementation"""

    def __init__(self):
        self.engine = create_async_engine(
            url=settings.database.postgres_url, pool_pre_ping=True
        )
        self.session_factory = async_sessionmaker(
            bind=self.engine, autocommit=False, autoflush=False
        )

    async def get_session(self) -> AsyncIterator:
        """
        Return a new session

        Yields:
            Iterator[AsyncSession]: The new session connection
        """
        async with self.session_factory() as session:
            yield session

    async def init_db(self) -> None:
        """
        Create the database tables

        Returns:
            None
        """
        async with self.engine.begin() as connection:
            await connection.run_sync(
                lambda sync_conn: Base.metadata.create_all(sync_conn)
            )


database = PostgresDatabase()
