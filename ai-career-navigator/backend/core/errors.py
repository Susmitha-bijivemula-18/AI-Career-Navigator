# backend/core/errors.py - Custom exceptions and global FastAPI exception handlers
import traceback
from fastapi import FastAPI, Request, status
from fastapi.responses import JSONResponse
from core.logging import logger

class JobFetchError(Exception):
    """Raised when an external job API fetcher fails."""
    pass

class CacheError(Exception):
    """Raised when Redis cache operations fail."""
    pass

class InsightComputeError(Exception):
    """Raised when calculations in the insight worker fail."""
    pass

def register_error_handlers(app: FastAPI) -> None:
    @app.exception_handler(JobFetchError)
    async def job_fetch_error_handler(request: Request, exc: JobFetchError):
        logger.warning("job_fetch_failed", path=request.url.path, error=str(exc))
        return JSONResponse(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            content={"detail": f"Job source service temporarily unavailable: {str(exc)}"}
        )

    @app.exception_handler(CacheError)
    async def cache_error_handler(request: Request, exc: CacheError):
        # Degraded mode: log cache error, continue using DB
        logger.warning("cache_error_fallback", path=request.url.path, error=str(exc))
        # This handler will be active if exceptions bubbled up from API route handlers,
        # but inside service/route logic, we should manually catch CacheError and proceed.
        # This handler acts as a safety net.
        return JSONResponse(
            status_code=status.HTTP_502_BAD_GATEWAY,
            content={"detail": f"Cache server issue: {str(exc)}"}
        )

    @app.exception_handler(InsightComputeError)
    async def insight_compute_error_handler(request: Request, exc: InsightComputeError):
        logger.error("insight_computation_failed", path=request.url.path, error=str(exc))
        return JSONResponse(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            content={"detail": f"Insight engine computation failed: {str(exc)}"}
        )

    @app.exception_handler(ValueError)
    async def value_error_handler(request: Request, exc: ValueError):
        logger.warning("validation_error", path=request.url.path, error=str(exc))
        return JSONResponse(
            status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
            content={"detail": [{"loc": ["body"], "msg": str(exc), "type": "value_error"}]}
        )

    @app.exception_handler(Exception)
    async def global_exception_handler(request: Request, exc: Exception):
        tb = traceback.format_exc()
        logger.error("unhandled_server_exception", path=request.url.path, error=str(exc), traceback=tb)
        return JSONResponse(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            content={"detail": "An unexpected server error occurred."}
        )
