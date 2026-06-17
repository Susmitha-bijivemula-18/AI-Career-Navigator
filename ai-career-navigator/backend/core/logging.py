# backend/core/logging.py - Structlog setup with rotating logs
import logging
import logging.handlers
import os
import sys
import structlog
from core.config import settings

def configure_logging():
    log_dir = os.path.abspath(os.path.join(os.path.dirname(__file__), "..", "logs"))
    os.makedirs(log_dir, exist_ok=True)
    log_file = os.path.join(log_dir, "app.log")

    # TIMED ROTATING FILE HANDLER: Rotates daily, keeps 7 days
    file_handler = logging.handlers.TimedRotatingFileHandler(
        log_file, when="midnight", interval=1, backupCount=7, encoding="utf-8"
    )
    console_handler = logging.StreamHandler(sys.stdout)

    log_level = getattr(logging, settings.LOG_LEVEL.upper(), logging.INFO)

    # Structlog configuration
    processors = [
        structlog.contextvars.merge_contextvars,
        structlog.processors.add_log_level,
        structlog.processors.TimeStamper(fmt="iso"),
        structlog.processors.StackInfoRenderer(),
        structlog.processors.format_exc_info,
        structlog.processors.JSONRenderer(),
    ]

    structlog.configure(
        processors=processors,
        logger_factory=structlog.PrintLoggerFactory(),
        cache_logger_on_first_use=True,
    )

    # Configure root stdlib logger to flow through handlers
    root_logger = logging.getLogger()
    root_logger.setLevel(log_level)
    root_logger.handlers = []
    root_logger.addHandler(file_handler)
    root_logger.addHandler(console_handler)

configure_logging()
logger = structlog.get_logger("ai_career_navigator")
