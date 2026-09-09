from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from app.core.config import settings

database_url = settings.get_database_url()

connect_args = {}
if database_url.startswith("sqlite"):
    connect_args["check_same_thread"] = False

engine = create_engine(
    database_url,
    connect_args=connect_args,
    pool_pre_ping=True,
    echo=False
)

SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
