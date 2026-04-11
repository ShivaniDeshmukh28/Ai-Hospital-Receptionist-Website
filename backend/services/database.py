"""
Supabase database service.
Handles saving and retrieving patient records.
"""

import os
from datetime import datetime
from supabase import create_client, Client


def get_supabase() -> Client:
    url = os.getenv("SUPABASE_URL")
    key = os.getenv("SUPABASE_KEY")
    if not url or not key:
        raise ValueError("SUPABASE_URL and SUPABASE_KEY must be set in .env")
    return create_client(url, key)


async def save_patient(
    patient_name: str,
    patient_age: int,
    patient_query: str,
    ward: str,
    session_id: str,
) -> dict:
    """
    Insert a new patient record into Supabase.
    Returns the inserted row.
    """
    supabase = get_supabase()

    record = {
        "patient_name":  patient_name,
        "patient_age":   patient_age,
        "patient_query": patient_query,
        "ward":          ward,
        "session_id":    session_id,
        "timestamp":     datetime.utcnow().isoformat(),
        "status":        "registered",
    }

    response = supabase.table("patients").insert(record).execute()

    if response.data:
        return {"success": True, "id": response.data[0].get("id"), "message": "Patient saved successfully"}
    else:
        return {"success": False, "id": None, "message": "Failed to save patient"}


async def get_all_patients(limit: int = 100) -> list:
    """Fetch recent patient records (for admin view)."""
    supabase = get_supabase()
    response = (
        supabase.table("patients")
        .select("*")
        .order("timestamp", desc=True)
        .limit(limit)
        .execute()
    )
    return response.data or []
