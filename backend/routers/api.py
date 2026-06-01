from fastapi import APIRouter, HTTPException, Header, Request
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
    if not request.message.strip():
        raise HTTPException(status_code=400, detail="Message cannot be empty")
    if len(request.message) > 1000:
        raise HTTPException(status_code=400, detail="Message too long (max 1000 chars)")
    try:
        result = await run_chat(
            session_id=request.session_id,
            user_message=request.message,
            hospital_name=request.hospital_name,
            hospital_type=request.hospital_type,
            hospital_area=request.hospital_area,
            hospital_specialties=request.hospital_specialties,
        )
        return ChatResponse(**result)
    except Exception as e:
        print(f"[Chat Error] {e}")
        raise HTTPException(status_code=500, detail="AI service error. Please try again.")


# ── POST /save-patient ────────────────────────────────────────────────────────

@router.post("/save-patient", response_model=SavePatientResponse)
async def save_patient_record(request: SavePatientRequest):
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


# ── POST /book-facility ───────────────────────────────────────────────────────

@router.post("/book-facility")
async def book_facility(request: Request):
    try:
        body = await request.json()
        from services.email_service import send_appointment_email
        send_appointment_email(
            patient_name=body.get("name"),
            patient_email=body.get("email"),
            doctor=f"{body.get('facility')} Department",
            ward="Diagnostic Center",
            slot=body.get("slot"),
            fee=body.get("fee", 0),
        )
        return {"success": True, "message": "Booking confirmed and email sent"}
    except Exception as e:
        print(f"[Facility Booking Error] {e}")
        return {"success": False, "message": str(e)}


# ── POST /book-slot ───────────────────────────────────────────────────────────

@router.post("/book-slot")
async def book_slot(request: Request):
    try:
        body = await request.json()
        from services.email_service import send_appointment_email
        send_appointment_email(
            patient_name=body.get("name"),
            patient_email=body.get("email"),
            doctor=body.get("doctor"),
            ward=body.get("ward"),
            slot=f"{body.get('date')} at {body.get('time')}",
            fee=body.get("fee", 0),
        )
        return {"success": True, "message": "Slot booked and confirmation email sent"}
    except Exception as e:
        print(f"[Book Slot Error] {e}")
        return {"success": False, "message": str(e)}