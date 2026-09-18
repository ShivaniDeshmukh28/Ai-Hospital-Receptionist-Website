# AI Hospital Receptionist Website
# Software Requirements Specification (SRS)
# Updated Version with Symptom Guidance Functionality

## 1. Introduction

### 1.1 Purpose
The AI Hospital Receptionist Website is designed to help patients access basic healthcare guidance, register themselves for hospital assistance, and receive AI-supported triage recommendations. The system reduces the burden on hospital reception staff by automating patient intake and identifying the likely department or ward based on symptoms.

The updated version of the system now includes verified symptom guidance, urgency level classification, ward recommendation, and first-aid advice. This makes the project more useful for real-world healthcare support while still keeping the system as a preliminary guidance tool rather than a final diagnosis system.

### 1.2 Problem Statement
People struggle to access basic verified symptom guidance. In many cases, patients are unsure whether their symptoms are mild, moderate, or require emergency attention. They also often do not know which hospital department to approach or how to proceed before seeing a doctor.

This project addresses the problem by providing an AI-powered assistant that:
- interprets patient symptoms,
- determines urgency level,
- recommends the appropriate hospital ward,
- provides safe, general first-aid guidance,
- and helps patients book appointments or continue with hospital registration.

### 1.3 Scope
The system includes:
- patient symptom input,
- AI-based urgency analysis,
- ward recommendation,
- first-aid guidance,
- medical disclaimer,
- patient registration and appointment booking,
- doctor and slot selection,
- email confirmation,
- admin patient record retrieval,
- AI-powered hospital receptionist flow.

### 1.4 Intended Users
- Patients
- Hospital reception staff
- Hospital administrators
- System administrators

### 1.5 Objectives
The primary objectives of the system are:
- to provide preliminary, verified symptom guidance,
- to reduce patient confusion about hospital departments,
- to assist with quick registration and triage,
- to support hospital workflow efficiency,
- and to create a user-friendly AI healthcare experience.

## 2. Overall Description

### 2.1 Product Perspective
The system is a full-stack healthcare support application combining:
- Frontend: React + Vite + Tailwind CSS
- Backend: FastAPI + Python
- AI workflow: LangGraph + LangChain + Groq
- Database: Supabase/PostgreSQL
- Email service: appointment confirmation support
- Deployment: Vercel + Render

The system acts as a digital hospital receptionist that helps patients:
- describe their symptoms,
- receive AI-generated guidance,
- identify the appropriate hospital department,
- and proceed to appointment booking.

### 2.2 Product Functions
The software must provide:
- conversational patient intake,
- AI classification of symptoms by urgency,
- AI recommendation of hospital department or ward,
- first-aid guidance,
- appointment booking support,
- doctor recommendation,
- patient data saving,
- administrative access to records.

### 2.3 Assumptions and Constraints
- The system is intended for educational and prototype use.
- It is not a substitute for licensed medical advice.
- Real-time medical emergencies should be directed to emergency services or immediate hospital care.
- AI predictions may require human validation before production deployment.
- The system depends on external services such as Groq and Supabase.

## 3. Specific Requirements

### 3.1 Functional Requirements

#### 3.1.1 Patient Symptom Input
The system shall allow a patient to enter symptoms in plain English or simple conversational text.

Examples:
- “I have fever and cough for 2 days.”
- “I am having chest pain and shortness of breath.”
- “My child has a high fever.”
- “I have severe stomach pain.”

#### 3.1.2 Symptom Analysis
The system shall analyze the patient’s symptom description using AI.
The AI shall determine:
- urgency level: LOW, MODERATE, or EMERGENCY,
- recommended ward,
- first-aid guidance,
- medical disclaimer.

#### 3.1.3 Urgency Classification
The system shall classify patient symptoms into:
- LOW: Non-critical symptoms that can be managed with general first-aid and medical consultation.
- MODERATE: Symptoms requiring attention but not necessarily emergency care.
- EMERGENCY: Critical symptoms such as chest pain, severe bleeding, unconsciousness, breathing difficulty, or severe trauma.

#### 3.1.4 Recommended Ward
The system shall recommend the relevant hospital department based on the symptom description.
Examples:
- General Medicine
- Cardiology
- Orthopedics
- Emergency
- Pediatrics
- Gynecology
- Eye/ENT
- Dental
- Mental Health

#### 3.1.5 First-Aid Guidance
The system shall provide safe, generic, and practical guidance to patients while they wait for care.
Examples:
- Rest and hydrate
- Sit in a comfortable position
- Avoid heavy activity
- Seek urgent help if symptoms worsen

The system must not prescribe medicines or provide risky medical instructions.

#### 3.1.6 Verified Medical Disclaimer
The system shall include a disclaimer stating that:
- the guidance is AI-based and for preliminary support,
- it is not a replacement for professional medical diagnosis,
- and patients should consult doctors in urgent or serious situations.

#### 3.1.7 Patient Registration Support
The system shall collect patient details such as:
- name,
- age,
- complaint or symptoms,
- assigned ward,
- selected doctor,
- appointment slot,
- email.

#### 3.1.8 Doctor Recommendation
The system shall recommend a doctor based on the assigned ward and available doctors.

#### 3.1.9 Slot Booking
The system shall allow patients to choose available appointment slots.

#### 3.1.10 Email Confirmation
The system shall send appointment confirmation to the patient’s email.

#### 3.1.11 Patient Record Storage
The system shall save the patient record in Supabase/PostgreSQL.

#### 3.1.12 Admin Data Retrieval
The system shall allow administrators to fetch all patient records using a protected API endpoint.

#### 3.1.13 Health Check Endpoint
The backend shall expose a health check endpoint for system availability.

#### 3.1.14 Conversational Hospital Reception Flow
The system shall support conversational patient interaction to:
- collect basic patient information one question at a time,
- classify the patient’s condition into a ward,
- recommend a doctor,
- gather appointment details,
- and confirm the final booking.

#### 3.1.15 Emergency Handling
If the symptom description indicates emergency medical risk, the system shall prioritize safety and recommend urgent hospital attention.

### 3.2 Non-Functional Requirements

#### 3.2.1 Reliability
The system must provide stable behavior for symptom analysis and patient registration.

#### 3.2.2 Security
The system must protect:
- API keys,
- database credentials,
- admin access,
- and environment variables.

#### 3.2.3 Privacy
Patient health information must be stored securely and only used for legitimate healthcare support purposes.

#### 3.2.4 Scalability
The current application is suitable for prototype and academic project deployment. For production, it should support:
- persistent session storage,
- stronger authentication,
- more robust role-based access control,
- and better medical safety validation.

#### 3.2.5 Maintainability
The system should maintain a clean separation among:
- frontend,
- backend,
- AI workflow,
- database,
- and service modules.

#### 3.2.6 Safety and Medical Ethics
The system must clearly communicate that:
- it is not a doctor,
- it is not a final medical diagnosis,
- and emergency cases must be handled by medical professionals immediately.

### 3.3 Technical Requirements

#### 3.3.1 Frontend Requirements
The frontend must:
- allow symptom entry,
- render AI response in a user-friendly format,
- display urgency classification,
- display ward recommendation,
- display first-aid guidance,
- display disclaimer,
- allow patient registration,
- allow doctor selection,
- allow slot selection,
- allow email confirmation.

#### 3.3.2 Backend Requirements
The backend must:
- accept patient symptom requests,
- process AI triage logic,
- classify urgency,
- return JSON response with symptom guidance,
- integrate with Groq API,
- manage patient record storage,
- expose endpoints for chat, patient saving, records retrieval, health status, and triage analysis.

#### 3.3.3 AI Requirements
The AI module must:
- parse symptom descriptions,
- interpret urgency,
- suggest the appropriate department,
- provide safe first-aid instructions,
- return structured output in JSON format.

#### 3.3.4 Database Requirements
The system must store:
- patient name
- age
- symptom description
- ward
- doctor
- slot
- fee
- email
- urgency level
- first-aid guidance
- verified disclaimer

## 4. Updated API Functionality

### 4.1 POST /triage/analyze
This endpoint accepts:
- patient_id
- symptoms_description

It returns:
- status
- patient_id
- data
  - urgency_level
  - recommended_ward
  - first_aid_guidance
  - verified_disclaimer

This API is used to provide verified symptom guidance to the patient before or during hospital registration.

### 4.2 POST /chat
This endpoint handles general conversational registration and uses the LangGraph workflow to:
- classify the patient’s issue to a ward,
- ask one question at a time,
- collect basic details,
- recommend a doctor,
- book an appointment.

### 4.3 POST /save-patient
This endpoint stores patient details in the database.

### 4.4 GET /patients
This endpoint retrieves all patient records for admin access.

### 4.5 GET /health
This endpoint checks if the backend service is running.

## 5. Use Cases

### 5.1 Patient Checks Symptoms
- Patient enters symptom description.
- System classifies urgency.
- System recommends ward and provides first-aid guidance.
- System shows disclaimer.

### 5.2 Patient Seeks Department Guidance
- Patient describes a health concern.
- System suggests the correct hospital department.

### 5.3 Patient Registers for Appointment
- Patient enters personal details.
- System recommends a doctor.
- Patient chooses a slot.
- Confirmation email is sent.

### 5.4 Admin Reviews Patient Data
- Admin views patient records.
- Data is used for hospital workflow improvement.

## 6. System Workflow

### 6.1 Primary Workflow
1. Patient enters symptoms.
2. AI evaluates urgency.
3. System recommends ward.
4. System gives first-aid guidance.
5. System displays disclaimer.
6. Patient provides personal details.
7. System recommends doctor and slot.
8. Appointment is confirmed.

### 6.2 Hospital Receptionist Workflow
1. Patient interacts with receptionist AI.
2. AI collects patient details one at a time.
3. AI assigns ward.
4. AI recommends doctor.
5. Final response is generated.
6. Patient record is stored.

## 7. System Architecture

The system includes the following major modules:
- Frontend Interface
- Backend APIs
- AI Triage Module
- Doctor and Ward Recommendation Engine
- Database Storage
- Notification/Email Service
- Admin Access Layer

## 8. Risk Analysis and Limitations
- AI-generated medical guidance should be used only as preliminary support.
- The system may misclassify symptoms if input is unclear.
- Emergency symptoms must always be escalated immediately to medical staff.
- Current implementation is suitable for academic/demo use, not full clinical deployment.

## 9. Conclusion
The updated AI Hospital Receptionist Website addresses the original problem statement: people struggle to access basic verified symptom guidance. The system provides a practical solution by combining AI symptom triage, hospital ward recommendation, patient registration, and appointment booking. It serves as an efficient digital receptionist and a useful educational healthcare support project.

---

This document is the second SRS for the repository and reflects the updated symptom-guidance functionality implemented in the project.
