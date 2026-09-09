import uuid
from datetime import datetime, timezone
from typing import Any, Dict, Optional


def generate_uuid() -> str:
    """Generate a standard string UUID4."""
    return str(uuid.uuid4())


def utc_now() -> datetime:
    """Return timezone-aware current UTC datetime."""
    return datetime.now(timezone.utc)


def format_response(
    data: Any = None,
    message: str = "Success",
    success: bool = True,
    meta: Optional[Dict[str, Any]] = None,
) -> Dict[str, Any]:
    """Standardized API response wrapper."""
    response = {
        "success": success,
        "message": message,
        "data": data,
    }
    if meta is not None:
        response["meta"] = meta
    return response
