# backend/core/errors.py - custom exception classes + handlers
class JobFetchError(Exception):
    """External API failure during job ingestion."""
    pass

class CacheError(Exception):
    """Redis cache unavailable."""
    pass

class InsightComputeError(Exception):
    """Insight worker failure."""
    pass

def register_error_handlers(app):
    from fastapi import Request
    from fastapi.responses import JSONResponse
    from core.logging import log
    
    @app.exception_handler(JobFetchError)
    async def job_fetch_error_handler(request: Request, exc: JobFetchError):
        log.warning("job_fetch_error_handler", error=str(exc))
        return JSONResponse(status_code=503, content={"message": "External API failure during job ingestion."})

    @app.exception_handler(CacheError)
    async def cache_error_handler(request: Request, exc: CacheError):
        log.warning("cache_error_handler", error=str(exc))
        return JSONResponse(status_code=500, content={"message": "Cache temporarily unavailable."})

    @app.exception_handler(Exception)
    async def general_exception_handler(request: Request, exc: Exception):
        log.error("unhandled_exception", error=str(exc), path=request.url.path)
        return JSONResponse(status_code=500, content={"message": "Internal server error."})
