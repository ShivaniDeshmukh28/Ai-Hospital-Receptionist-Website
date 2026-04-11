"""
AI Hospital Receptionist — FastAPI Backend
Run: uvicorn main:app --reload --port 8000
Docs: http://localhost:8000/docs
"""

import os
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from dotenv import load_dotenv

from routers.api import router

# Load environment variables from .env file
load_dotenv()

# ── App ───────────────────────────────────────────────────────────────────────

app = FastAPI(
    title="AI Hospital Receptionist API v1.0",
    description="LangGraph-powered AI kiosk for hospital patient registration",
    version="1.0.0",
    docs_url="/docs",
    redoc_url="/redoc",
)

# ── CORS ──────────────────────────────────────────────────────────────────────
# Allow frontend (React on port 5173) to call the backend

FRONTEND_URL = os.getenv("FRONTEND_URL", "http://localhost:5173")

app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        FRONTEND_URL,
        "http://localhost:5173",
        "http://localhost:3000",
    ],
    allow_origin_regex=r"https://.*\.(vercel|netlify)\.app",
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ── Routes ────────────────────────────────────────────────────────────────────

app.include_router(router)


# ── Startup ───────────────────────────────────────────────────────────────────

@app.on_event("startup")
async def startup():
    print("=" * 50)
    print("  AI Hospital Receptionist API  v1.0")
    print("  Docs:  http://localhost:8000/docs")
    print("  Health: http://localhost:8000/health")
    print("=" * 50)

    # Check required env vars
    missing = []
    for key in ["OPENAI_API_KEY", "SUPABASE_URL", "SUPABASE_KEY"]:
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