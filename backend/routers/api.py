from fastapi import APIRouter, HTTPException, Header
from typing import Optional
import os

from models.schemas import (
    ChatRequest, ChatResponse,
    SavePatientRequest, SavePatientResponse,
)
from services.graph import run_chat
from services import database

router = APIRouter()


# ── POST /chat ────────────────────────────────────────────────────────────────

@router.post("/chat", response_model=ChatResponse)
async def chat(request: ChatRequest):
    """
    Main chat endpoint.
    Accepts user message + session_id, returns AI reply + ward classification.
    """
    if not request.message.strip():
        raise HTTPException(status_code=400, detail="Message cannot be empty")

    if len(request.message) > 1000:
        raise HTTPException(status_code=400, detail="Message too long (max 1000 chars)")

    try:
        result = await run_chat(
            session_id=request.session_id,
            user_message=request.message,
        )
        return ChatResponse(**result)

    except Exception as e:
        print(f"[Chat Error] {e}")
        raise HTTPException(status_code=500, detail="AI service error. Please try again.")


# ── POST /save-patient ────────────────────────────────────────────────────────

@router.post("/save-patient", response_model=SavePatientResponse)
async def save_patient_record(request: SavePatientRequest):
    """
    Save completed patient record to Supabase.
    Called after all patient details are collected.
    """
    try:
        result = await database.save_patient(
            patient_name=request.patient_name,
            patient_age=request.patient_age,
            patient_query=request.patient_query,
            ward=request.ward,
            session_id=request.session_id,
        )
        return SavePatientResponse(**result)

    except Exception as e:
        print(f"[Save Patient Error] {e}")
        raise HTTPException(status_code=500, detail="Could not save patient record")


# ── GET /patients ─────────────────────────────────────────────────────────────

@router.get("/patients")
async def get_patients(
    x_api_key: Optional[str] = Header(None),
    limit: int = 50,
):
    """
    Admin endpoint — fetch recent patient records.
    Protected by X-API-Key header.
    """
    expected_key = os.getenv("ADMIN_API_KEY", "hospital-admin-2025")
    if x_api_key != expected_key:
        raise HTTPException(status_code=401, detail="Unauthorized")

    try:
        patients = await database.get_all_patients(limit=limit)
        return {"patients": patients, "count": len(patients)}
    except Exception as e:
        print(f"[Get Patients Error] {e}")
        raise HTTPException(status_code=500, detail="Could not fetch patients")


# ── GET /health ───────────────────────────────────────────────────────────────

@router.get("/health")
async def health_check():
    return {"status": "ok", "service": "AI Hospital Receptionist API"}
