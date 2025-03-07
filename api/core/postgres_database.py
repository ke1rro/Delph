"""Module for PostgreSQL database implementation"""

from sqlalchemy.ext.asyncio import (AsyncSession, async_sessionmaker,
                                    create_async_engine)

from .database import DATABASE_URL, Base


class PostgresDatabase:
    """PostgreSQL database implementation"""

    def __init__(self):
        self.engine = create_async_engine(url=DATABASE_URL, pool_pre_ping=True)
        self.session_factory = async_sessionmaker(
            bind=self.engine, autocommit=False, autoflush=False
        )

    async def get_session(self) -> AsyncSession:
        """Return a new session"""
        async with self.session_factory() as session:
            yield session

    async def init_db(self) -> None:
        """Create the database tables"""
        async with self.engine.begin() as connection:
            await connection.run_sync(
                lambda sync_conn: Base.metadata.create_all(sync_conn)
            )


database = PostgresDatabase()
