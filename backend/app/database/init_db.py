from app.database.base import Base
from app.database.session import engine
from app.utils.logger import logger
# Import all models to ensure they are registered with SQLAlchemy Base metadata
import app.models  # noqa: F401


def init_db() -> None:
    """
    Initialize database schema.
    Creates all defined tables if they do not already exist.
    Does NOT seed mock or fake production data.
    """
    try:
        logger.info("Initializing database tables...")
        Base.metadata.create_all(bind=engine)
        logger.info(f"Database tables initialized successfully. Registered tables: {list(Base.metadata.tables.keys())}")
    except Exception as e:
        logger.error(f"Error during database initialization: {e}")
        raise e


if __name__ == "__main__":
    init_db()
