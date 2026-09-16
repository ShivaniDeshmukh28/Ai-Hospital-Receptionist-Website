# AI Hospital Receptionist SRS

## 1. Overview
The AI Hospital Receptionist Website is a full-stack patient registration system that helps patients describe health concerns, receive AI-assisted ward classification, choose a doctor, and complete appointment booking through a hospital kiosk flow.

## 2. Objective
The system aims to reduce reception workload, automate patient intake, and provide immediate ward and doctor recommendations using AI.

## 3. Functional Requirements
- User login or authentication screen
- Welcome screen and hospital selection
- Conversational patient registration
- Ward classification using AI
- Doctor recommendation and slot selection
- Appointment email confirmation
- Patient record saving in Supabase
- Admin patient retrieval endpoint
- Backend health check

## 4. Tech Stack
- Frontend: React + Vite + TailwindCSS
- Backend: FastAPI + Python
- AI: LangGraph + Groq / LangChain
- Database: Supabase / PostgreSQL
- Email: Gmail SMTP
- Deployment: Vercel + Render

## 5. Use Cases
- Patient registers and describes symptoms
- AI assigns the correct ward
- Patient selects a doctor and time slot
- System sends confirmation email
- Admin reviews patient records

## 6. Non-Functional Requirements
- Security: API keys, env vars, CORS
- Privacy: patient data handling and secure storage
- Maintainability: clear frontend/backend separation
- Scalability: current session store is in-memory and should move to a persistent store in production

## 7. Deployment
Backend: `uvicorn main:app --host 0.0.0.0 --port 8000`
Frontend: `npm install` then `npm run build`

## 8. Notes
The repository is functional for a project prototype, but production hardening is recommended before deployment.
