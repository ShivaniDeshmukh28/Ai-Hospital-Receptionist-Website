import re
from pydantic import BaseModel, validator
from typing import Optional, List

# ── Chat & Registration Schemas ──────────────────────────────────────────────

class ChatRequest(BaseModel):
    message:              str
    session_id:           str
    user_lat:             Optional[float] = None
    user_lng:             Optional[float] = None
    # Hospital context passed from LocationPopup selection
    hospital_name:        Optional[str]       = None
    hospital_type:        Optional[str]       = None
    hospital_area:        Optional[str]       = None
    hospital_specialties: Optional[List[str]] = None


class PatientSummary(BaseModel):
    patient_name:  Optional[str]   = None
    patient_age:   Optional[int]   = None
    patient_query: Optional[str]   = None
    ward:          Optional[str]   = None
    doctor:        Optional[str]   = None
    slot:          Optional[str]   = None
    fee:           Optional[float] = None
    email:         Optional[str]   = None

    # ── Safety net: strip ₹ and any non-numeric chars before Pydantic parses ──
    @validator('fee', pre=True)
    def clean_fee(cls, v):
        if v is None:
            return None
        cleaned = re.sub(r'[^\d.]', '', str(v))
        return float(cleaned) if cleaned else None


class ChatResponse(BaseModel):
    reply:           str
    ward:            Optional[str] = None
    data_complete:   bool = False
    patient_summary: Optional[PatientSummary] = None


class SavePatientRequest(BaseModel):
    patient_name:  str
    patient_age:   int
    patient_query: str
    ward:          str
    session_id:    str


class SavePatientResponse(BaseModel):
    success: bool
    id:      Optional[str] = None
    message: str


# ── Symptom Triage & Guidance Schemas ────────────────────────────────────────

class SymptomRequest(BaseModel):
    patient_id:           Optional[str] = "GUEST"
    symptoms_description: str


class SymptomGuidanceOutput(BaseModel):
    urgency_level:       str   # LOW, MODERATE, EMERGENCY
    recommended_ward:    str
    first_aid_guidance:  str
    verified_disclaimer: str


class TriageResponse(BaseModel):
    status:     str
    patient_id: str
    data:       SymptomGuidanceOutput