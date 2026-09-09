from contextlib import asynccontextmanager
from fastapi import FastAPI, status
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse

from app.core.config import settings
from app.api.router import api_router
from app.database.init_db import init_db
from app.utils.logger import logger


@asynccontextmanager
async def lifespan(app: FastAPI):
    """Lifespan context manager for application startup and shutdown."""
    logger.info("Starting up AI Construction Safety & Risk Intelligence Backend...")
    try:
        init_db()
        logger.info("Database schemas verified.")
    except Exception as e:
        logger.warning(f"Database initialization deferred or failed: {e}")
    yield
    logger.info("Shutting down backend...")


app = FastAPI(
    title=settings.PROJECT_NAME,
    version=settings.PROJECT_VERSION,
    description="Scalable, Production-Grade REST API for AI-Powered Construction Safety & Risk Intelligence Platform",
    docs_url="/docs",
    redoc_url="/redoc",
    openapi_url="/openapi.json",
    lifespan=lifespan,
)

# CORS Configuration
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.BACKEND_CORS_ORIGINS if settings.BACKEND_CORS_ORIGINS else ["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Register main API router under /api
app.include_router(api_router, prefix=settings.API_V1_STR)


@app.get("/", tags=["Health"])
def root():
    """Root platform status and documentation pointer."""
    return {
        "project": settings.PROJECT_NAME,
        "version": settings.PROJECT_VERSION,
        "status": "online",
        "docs": "/docs",
        "api_v1": settings.API_V1_STR,
    }


@app.get("/health", tags=["Health"], status_code=status.HTTP_200_OK)
def health_check():
    """Health check endpoint for container orchestrators and monitoring tools."""
    return {
        "status": "healthy",
        "service": "construction-safety-backend",
        "version": settings.PROJECT_VERSION
    }


if __name__ == "__main__":
    import uvicorn
    uvicorn.run("app.main:app", host="0.0.0.0", port=8000, reload=True)
