from fastapi import APIRouter, HTTPException, Header, Request
from typing import Optional
import os

from langchain_groq import ChatGroq
from langchain_core.prompts import ChatPromptTemplate
from langchain_core.output_parsers import JsonOutputParser

from models.schemas import (
    ChatRequest, ChatResponse,
    SavePatientRequest, SavePatientResponse,
    SymptomRequest, TriageResponse, SymptomGuidanceOutput
)
from services.graph import run_chat
from services import database

router = APIRouter()


# ── POST /triage/analyze ─────────────────────────────────────────────────────

@router.post("/triage/analyze", response_model=TriageResponse)
async def analyze_symptoms(request: SymptomRequest):
    if not request.symptoms_description.strip():
        raise HTTPException(status_code=400, detail="Symptom description cannot be empty")
        
    api_key = os.getenv("GROQ_API_KEY")
    if not api_key:
        raise HTTPException(status_code=500, detail="GROQ_API_KEY environment variable missing")

    try:
        # Initialize Groq LLM with supported active model
        llm = ChatGroq(
            temperature=0.1,
            model_name="llama-3.1-70b-versatile",
            api_key=api_key
        )

        parser = JsonOutputParser(pydantic_object=SymptomGuidanceOutput)

        system_prompt = """
        You are an official AI Triage Assistant for a hospital kiosk.
        Analyze the patient's described symptoms and return a JSON object with:
        1. "urgency_level": 'LOW', 'MODERATE', or 'EMERGENCY'.
        2. "recommended_ward": Recommended hospital department (e.g., General Medicine, Cardiology, Orthopedics, Emergency, Dermatology, Pulmonology).
        3. "first_aid_guidance": 2-3 short, safe, practical immediate guidance steps while waiting for doctor.
        4. "verified_disclaimer": Standard medical disclaimer statement.

        Safety Rules:
        - If symptoms indicate severe chest pain, extreme bleeding, or loss of consciousness, mark 'EMERGENCY'.
        - Keep first-aid advice safe, generic, and actionable. Do NOT prescribe specific medicine names.

        {format_instructions}
        """

        prompt = ChatPromptTemplate.from_messages([
            ("system", system_prompt),
            ("user", "Patient Symptoms: {symptoms}")
        ]).partial(format_instructions=parser.get_format_instructions())

        chain = prompt | llm | parser
        
        # Execute LLM chain
        result = chain.invoke({"symptoms": request.symptoms_description})

        return {
            "status": "success",
            "patient_id": request.patient_id,
            "data": result
        }

    except Exception as e:
        print(f"[Triage Error] {e}")
        raise HTTPException(status_code=500, detail="Failed to process symptom triage analysis.")


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
            urgency_level=getattr(request, "urgency_level", "LOW"),
            first_aid_guidance=getattr(request, "first_aid_guidance", None),
            verified_disclaimer=getattr(request, "verified_disclaimer", None),
            doctor=getattr(request, "doctor", None),
            slot=getattr(request, "slot", None),
            email=getattr(request, "email", None),
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