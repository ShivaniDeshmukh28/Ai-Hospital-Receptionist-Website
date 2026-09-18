# AI Hospital Receptionist Website
# PowerPoint Presentation Outline

## Slide 1: Problem Statement
People struggle to access basic verified symptom guidance.

- Many patients are unsure whether their symptoms are mild, moderate, or emergency-level.
- Lack of immediate guidance leads to confusion and delayed care.
- Patients often do not know which department to approach in a hospital.
- There is a need for a simple AI-assisted healthcare assistant.

---

## Slide 2: Project Title and Overview
AI Hospital Receptionist Website

- AI-powered digital hospital receptionist
- Built for patient registration and triage support
- Helps users describe symptoms and receive basic guidance
- Designed for IBM SkillsBuild project

---

## Slide 3: Objective of the Project
To provide a simple and intelligent healthcare support system that:

- understands patient symptoms,
- classifies urgency level,
- recommends relevant hospital ward,
- gives safe first-aid guidance,
- helps with appointment booking.

---

## Slide 4: Key Features
- Symptom-based AI triage
- Emergency vs non-emergency classification
- Ward and department recommendation
- Patient registration and doctor selection
- Appointment slot booking
- Email confirmation
- Admin patient record access

---

## Slide 5: System Architecture
Frontend (React + Vite + Tailwind CSS)
- patient chat interface
- symptom input form
- appointment booking UI

Backend (FastAPI + Python)
- API endpoints
- triage logic
- patient storage and retrieval

AI Layer (LangGraph + LangChain + Groq)
- symptom analysis
- urgency classification
- ward recommendation

Database (Supabase/PostgreSQL)
- patient and appointment records

---

## Slide 6: Symptom Guidance Workflow
1. Patient enters symptoms
2. AI analyzes the message
3. System determines urgency level
4. Recommended ward is suggested
5. First-aid guidance is displayed
6. Medical disclaimer is shown
7. Patient continues registration or consults a doctor

---

## Slide 7: Functional Workflow
- Patient describes symptoms
- AI assigns a likely ward
- Doctor recommendation is generated
- Patient selects appointment slot
- Final confirmation is sent by email
- Hospital staff/admin can review records

---

## Slide 8: API Modules
- POST /triage/analyze
  - analyzes symptoms
  - returns urgency, ward, guidance, disclaimer
- POST /chat
  - handles patient conversation and registration
- POST /save-patient
  - stores patient data
- GET /patients
  - admin retrieval of patient records
- GET /health
  - health check for backend

---

## Slide 9: Tech Stack
- Frontend: React, Vite, Tailwind CSS
- Backend: FastAPI, Python
- AI: LangGraph, LangChain, Groq
- Database: Supabase, PostgreSQL
- Deployment: Render, Vercel

---

## Slide 10: Benefits
- Reduces confusion for patients
- Speeds up hospital intake process
- Helps identify the correct hospital department
- Provides initial triage support
- Supports efficient receptionist workflow

---

## Slide 11: Challenges and Limitations
- AI results are preliminary and not a final diagnosis
- Emergency cases must be escalated immediately
- Data privacy and security must be maintained
- Production deployment requires stronger validation and monitoring

---

## Slide 12: Future Scope
- support for multilingual symptom input
- real hospital integration
- AI voice assistant
- more advanced medical safety validation
- patient portal and dashboard
- integration with hospital ERP or EMR systems

---

## Slide 13: Conclusion
The AI Hospital Receptionist Website is a practical solution for the problem of limited access to basic verified symptom guidance.

It combines AI, healthcare workflow support, and patient registration to make hospital interaction faster, safer, and more accessible.

---

## Slide 14: Thank You
Thank You

Questions?
