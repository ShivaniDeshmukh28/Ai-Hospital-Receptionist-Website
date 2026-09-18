from pydantic import BaseModel
from typing import Optional, List


class ChatRequest(BaseModel):
    message:    str
    session_id: str
    user_lat:   Optional[float] = None
    user_lng:   Optional[float] = None
    # Hospital context passed from LocationPopup selection
    hospital_name:        Optional[str]       = None
    hospital_type:        Optional[str]       = None
    hospital_area:        Optional[str]       = None
    hospital_specialties: Optional[List[str]] = None


class PatientSummary(BaseModel):
    patient_name:  Optional[str] = None
    patient_age:   Optional[int] = None
    patient_query: Optional[str] = None
    ward:          Optional[str] = None
    doctor:        Optional[str] = None
    slot:          Optional[str] = None
    fee:           Optional[float] = None
    email:         Optional[str] = None


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