import logging
import sys
from typing import Optional


def setup_logger(name: Optional[str] = None) -> logging.Logger:
    """Configure and return application logger."""
    logger_name = name or "construction_safety"
    logger = logging.getLogger(logger_name)
    
    if not logger.handlers:
        logger.setLevel(logging.INFO)
        formatter = logging.Formatter(
            "[%(asctime)s] [%(levelname)s] [%(name)s:%(lineno)d] - %(message)s"
        )
        console_handler = logging.StreamHandler(sys.stdout)
        console_handler.setFormatter(formatter)
        logger.addHandler(console_handler)
        logger.propagate = False
        
    return logger


logger = setup_logger()
