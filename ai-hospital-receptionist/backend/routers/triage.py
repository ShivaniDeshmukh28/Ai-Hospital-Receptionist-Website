from fastapi import APIRouter, HTTPException
from app.models.schemas import SymptomRequest, TriageResponse
from app.services.triage_service import triage_service

router = APIRouter(prefix="/api/triage", tags=["Symptom Triage"])

@router.post("/analyze", response_model=TriageResponse)
async def analyze_patient_symptoms(request: SymptomRequest):
    try:
        guidance_result = await triage_service.analyze_symptoms(request.symptoms_description)
        return {
            "status": "success",
            "patient_id": request.patient_id,
            "data": guidance_result
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))