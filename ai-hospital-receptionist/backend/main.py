"""
AI Hospital Receptionist — FastAPI Backend
Run: uvicorn main:app --reload --port 8000
Docs: http://localhost:8000/docs
"""

import os
from dotenv import load_dotenv
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

# Load environment variables from .env file
load_dotenv()

# ── App ───────────────────────────────────────────────────────────────────────

app = FastAPI(
    title="AI Hospital Receptionist API v1.0",
    description="LangGraph-powered AI kiosk for hospital patient registration and verified symptom triage",
    version="1.0.0",
    docs_url="/docs",
    redoc_url="/redoc",
)

# ── CORS ──────────────────────────────────────────────────────────────────────
# Allow frontend (React on port 5173 or custom FRONTEND_URL) to call the backend

FRONTEND_URL = os.getenv("FRONTEND_URL", "http://localhost:5173")

origins = [
    "http://localhost:5173",
    "http://127.0.0.1:5173",
]

# Include FRONTEND_URL dynamically if it's set and not already present
if FRONTEND_URL and FRONTEND_URL not in origins:
    origins.append(FRONTEND_URL)

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ── Routes ────────────────────────────────────────────────────────────────────

from routers.api import router

app.include_router(router)


# ── Startup ───────────────────────────────────────────────────────────────────

@app.on_event("startup")
async def startup():
    print("=" * 50)
    print("  AI Hospital Receptionist API  v1.0")
    print("  Docs:   http://localhost:8000/docs")
    print("  Health: http://localhost:8000/health")
    print("=" * 50)

    # Check required env vars
    missing = []
    for key in ["GROQ_API_KEY", "SUPABASE_URL", "SUPABASE_KEY"]:
        if not os.getenv(key):
            missing.append(key)
    if missing:
        print(f"  ⚠️  Missing env vars: {', '.join(missing)}")
        print("  Copy .env.template → .env and fill in the values")
    else:
        print("  ✅ All environment variables loaded")
    print("=" * 50)


# ── Run directly ──────────────────────────────────────────────────────────────

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)