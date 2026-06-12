# main.py - FastAPI app + CORS + health check + routes
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from routes.upload import router as upload_router
from routes.jobs import router as jobs_router

app = FastAPI(title="AI Career Navigator API")

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

@app.get("/")
def health_check():
    return {"status": "ok", "message": "Backend is running!"}
