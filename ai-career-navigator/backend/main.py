# main.py - FastAPI app + CORS + health check + routes
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from routes.upload import router as upload_router
from routes.jobs import router as jobs_router
from routes.analyze import router as analyze_router
from routes.gap import router as gap_router
from routes.suggest import router as suggest_router
from routes.simulator import router as simulator_router
from routes.recommend import router as recommend_router

# Phase 3 router imports
from routes.feed import router as feed_router
from routes.rank import router as rank_router
from routes.insights import router as insights_router
from routes.hiring import router as hiring_router
from routes.analytics import router as analytics_router
from routes.saved import router as saved_router

# Phase 3 database/caching/scheduling helper imports
from db.indexes import init_db_indexes
from cache.redis_client import redis_client
from workers.scheduler import start_scheduler, shutdown_scheduler
from core.errors import register_error_handlers

app = FastAPI(title="AI Career Navigator API")

# Register Phase 3 global exception handlers
register_error_handlers(app)

# Add CORS middleware to allow requests from the frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"],  # Vite's default dev server port
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(upload_router, prefix="/upload", tags=["Upload"])
app.include_router(jobs_router, prefix="/jobs", tags=["Jobs"])
app.include_router(analyze_router, prefix="/analyze", tags=["Analyze"])
app.include_router(gap_router, prefix="/gap-analysis", tags=["Gap Analysis"])
app.include_router(suggest_router, prefix="/suggest", tags=["Suggest"])
app.include_router(simulator_router, prefix="/simulate", tags=["Simulate"])
app.include_router(recommend_router, prefix="/recommend", tags=["Recommend"])

# Register Phase 3 route handlers
app.include_router(feed_router, prefix="/feed", tags=["Feed"])
app.include_router(rank_router, prefix="/rank", tags=["Rank"])
app.include_router(insights_router, prefix="/insights", tags=["Insights"])
app.include_router(hiring_router, prefix="/hiring", tags=["Hiring Intel"])
app.include_router(analytics_router, prefix="/analytics", tags=["Analytics"])
app.include_router(saved_router, prefix="/saved", tags=["Saved Jobs"])

@app.get("/")
def health_check():
    return {"status": "ok", "message": "Backend is running!"}

# Register application startup and shutdown hook listeners
@app.on_event("startup")
async def startup():
    await init_db_indexes()
    await redis_client.connect()
    start_scheduler()

@app.on_event("shutdown")
async def shutdown():
    shutdown_scheduler()
    await redis_client.disconnect()

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("main:app", host="127.0.0.1", port=8000, reload=True)

