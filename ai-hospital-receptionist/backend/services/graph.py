"""
AI Hospital Receptionist - Simplified LangGraph workflow
"""

import os
import json
import re
from typing import TypedDict, Optional, List
from datetime import datetime

from langgraph.graph import StateGraph, END
from langchain_groq import ChatGroq
from langchain_core.messages import SystemMessage, HumanMessage, AIMessage
import httpx


# ── Doctors Database ──────────────────────────────────────────────────────────

DOCTORS = {
    "General Ward": [
        {"name": "Dr. Rajesh Sharma", "fee": 500,  "slots": ["10:00 AM", "11:00 AM", "3:00 PM"]},
        {"name": "Dr. Priya Patel",   "fee": 400,  "slots": ["9:00 AM",  "12:00 PM", "4:00 PM"]},
    ],
    "Emergency Ward": [
        {"name": "Dr. Arjun Mehta",   "fee": 1000, "slots": ["Available 24/7"]},
        {"name": "Dr. Sunita Rao",    "fee": 1000, "slots": ["Available 24/7"]},
    ],
    "Mental Health Ward": [
        {"name": "Dr. Anil Desai",    "fee": 800,  "slots": ["11:00 AM", "2:00 PM", "5:00 PM"]},
        {"name": "Dr. Meera Joshi",   "fee": 700,  "slots": ["10:00 AM", "1:00 PM", "4:00 PM"]},
    ],
    "Orthopedic Ward": [
        {"name": "Dr. Suresh Patil",  "fee": 600,  "slots": ["10:00 AM", "12:00 PM", "4:00 PM"]},
        {"name": "Dr. Kavita Singh",  "fee": 550,  "slots": ["9:00 AM",  "11:00 AM", "3:00 PM"]},
    ],
    "Cardiology Ward": [
        {"name": "Dr. Ramesh Gupta",  "fee": 900,  "slots": ["10:00 AM", "1:00 PM", "4:00 PM"]},
        {"name": "Dr. Neha Kapoor",   "fee": 850,  "slots": ["11:00 AM", "2:00 PM", "5:00 PM"]},
    ],
    "Pediatric Ward": [
        {"name": "Dr. Anjali Mehta",  "fee": 400,  "slots": ["9:00 AM",  "11:00 AM", "3:00 PM"]},
        {"name": "Dr. Vikram Shah",   "fee": 450,  "slots": ["10:00 AM", "12:00 PM", "4:00 PM"]},
    ],
    "Gynecology Ward": [
        {"name": "Dr. Sunita Desai",  "fee": 600,  "slots": ["10:00 AM", "12:00 PM", "3:00 PM"]},
        {"name": "Dr. Pooja Rao",     "fee": 550,  "slots": ["9:00 AM",  "11:00 AM", "4:00 PM"]},
    ],
    "Eye/ENT Ward": [
        {"name": "Dr. Arun Joshi",    "fee": 500,  "slots": ["10:00 AM", "1:00 PM",  "4:00 PM"]},
        {"name": "Dr. Smita Kulkarni","fee": 450,  "slots": ["9:00 AM",  "11:00 AM", "3:00 PM"]},
    ],
    "Dental Ward": [
        {"name": "Dr. Rohit Verma",   "fee": 350,  "slots": ["10:00 AM", "12:00 PM", "4:00 PM"]},
        {"name": "Dr. Priya Nair",    "fee": 300,  "slots": ["9:00 AM",  "11:00 AM", "3:00 PM"]},
    ],
}


# ── State ─────────────────────────────────────────────────────────────────────

class PatientState(TypedDict):
    chat_history:       List[dict]
    patient_name:       Optional[str]
    patient_age:        Optional[int]
    patient_query:      Optional[str]
    assigned_ward:      Optional[str]
    assigned_doctor:    Optional[str]
    appointment_slot:   Optional[str]
    consultation_fee:   Optional[int]
    patient_email:      Optional[str]
    data_complete:      bool
    last_reply:         str
    # Hospital context from LocationPopup
    hospital_name:        Optional[str]
    hospital_type:        Optional[str]
    hospital_area:        Optional[str]
    hospital_specialties: Optional[List[str]]


# ── LLM ───────────────────────────────────────────────────────────────────────

# ── LLM ───────────────────────────────────────────────────────────────────────

# ── LLM ───────────────────────────────────────────────────────────────────────

def get_llm():
    api_key = os.getenv("GROQ_API_KEY")
    if not api_key:
        raise ValueError(
            "GROQ_API_KEY is not set. Add it to your .env file "
            "as GROQ_API_KEY=your_key_here"
        )
    return ChatGroq(
        model="openai/gpt-oss-120b",
        temperature=0.3,
        api_key=api_key,
    )

# ── Helpers ───────────────────────────────────────────────────────────────────

def history_to_text(chat_history) -> str:
    result = []
    if not chat_history:
        return ""
    for m in chat_history:
        if not isinstance(m, dict):
            continue
        role = m.get("role", "")
        content = m.get("content", "")
        if role and content:
            result.append(f"{role.upper()}: {content}")
    return "\n".join(result)


def last_user_message(chat_history) -> str:
    if not chat_history:
        return ""
    for m in reversed(chat_history):
        if isinstance(m, dict) and m.get("role") == "user":
            return m.get("content", "")
    return ""


# ── Node: Router ──────────────────────────────────────────────────────────────

def router_node(state: PatientState) -> dict:
    llm = get_llm()
    msg = last_user_message(state.get("chat_history", []))

    existing_ward = state.get("assigned_ward")
    if existing_ward:
        return {"assigned_ward": existing_ward, "last_reply": state.get("last_reply", "")}

    response = llm.invoke([
        SystemMessage(content="""You are a hospital triage assistant.
Classify the patient message into ONE of these wards:
- General Ward: fever, cough, cold, body ache, general checkup, ulcer, stomach pain, sardi, khasi, bukhar
- Emergency Ward: chest pain, difficulty breathing, severe bleeding, unconscious, accidents, heart attack
- Mental Health Ward: anxiety, depression, stress, mental health, suicidal thoughts, tanav, udasi
- Orthopedic Ward: bone pain, joint pain, fracture, back pain, knee pain, shoulder pain, spine
- Cardiology Ward: heart problem, palpitations, high BP, low BP, cholesterol, cardiac
- Pediatric Ward: child health, baby, infant, kids fever, child vaccination, newborn
- Gynecology Ward: periods, menstrual, pregnancy, women health, PCOD, PCOS, delivery
- Eye/ENT Ward: eye pain, vision, ear pain, hearing loss, nose bleed, throat pain, sinusitis
- Dental Ward: tooth pain, cavity, gum problem, teeth, dental, mouth ulcer

The patient may communicate in English, Hindi, or Marathi. Understand their intent and classify accordingly.

Reply with ONLY one of these exact strings:
General Ward
Emergency Ward
Mental Health Ward
Orthopedic Ward
Cardiology Ward
Pediatric Ward
Gynecology Ward
Eye/ENT Ward
Dental Ward"""),
        HumanMessage(content=msg or "general checkup"),
    ])

    ward = response.content.strip()
    valid_wards = list(DOCTORS.keys())
    if ward not in valid_wards:
        ward = "General Ward"

    return {"assigned_ward": ward, "last_reply": ""}


# ── Node: Ward Conversation ───────────────────────────────────────────────────

def ward_node(state: PatientState) -> dict:
    llm = get_llm()
    ward          = state.get("assigned_ward", "General Ward")
    history       = state.get("chat_history", [])
    hospital_name = state.get("hospital_name") or "our hospital"
    hospital_area = state.get("hospital_area") or ""

    name   = state.get("patient_name")     or "Not collected"
    age    = state.get("patient_age")      or "Not collected"
    query  = state.get("patient_query")    or "Not collected"
    doctor = state.get("assigned_doctor")  or "Not assigned"
    slot   = state.get("appointment_slot") or "Not chosen"
    email  = state.get("patient_email")    or "Not collected"

    # Build hospital identity line for system prompt
    hospital_line = f"You are a polite AI hospital receptionist at {hospital_name}"
    if hospital_area:
        hospital_line += f", {hospital_area}"
    hospital_line += f" — specifically handling the {ward}."

    system = f"""{hospital_line}
{"Be calm but efficient - this may be urgent." if ward == "Emergency Ward" else ""}
{"Be gentle and empathetic." if ward == "Mental Health Ward" else ""}

CRITICAL LANGUAGE RULE: Always respond in ENGLISH by default, regardless of what language the user types in. Only switch to Hindi or Marathi if the user explicitly asks you to respond in that language.

Follow these steps IN ORDER. Move to next step only when current step is complete.

STEP 1 - Collect basic info ONE AT A TIME (skip if already collected):
1. Patient full name
2. Patient age
3. Health concern/symptoms

STEP 2 - Once all 3 collected, recommend a doctor:
Available doctors in {ward}:
{json.dumps(DOCTORS.get(ward, []), indent=2)}
- Recommend ONE doctor by name
- Show details in this EXACT table format:

| Detail | Info |
|--------|------|
| 👨‍⚕️ Doctor | Dr. Name Here |
| 🏥 Ward | {ward} |
| 💰 Fee | ₹amount |
| 🕐 Available Slots | slot1, slot2, slot3 |

- Then ask: "Which slot would you like to book?"

STEP 3 - Once slot is chosen, ask for email:
Ask exactly: "Please provide your email address to receive the appointment confirmation."

STEP 4 - Once email is provided, confirm and finish:
Say exactly: "Thank you [name], your appointment is confirmed with [doctor] at [slot]. Ward: {ward}. Fee: ₹[fee]. Confirmation will be sent to [email]."

Already collected:
- Name: {name}
- Age: {age}
- Health concern: {query}
- Doctor: {doctor}
- Slot: {slot}
- Email: {email}

IMPORTANT RULES:
- Ask ONE question at a time only
- Do NOT skip asking for email — it is required
- Be warm and professional
- Always reply in ENGLISH unless user explicitly requests Hindi or Marathi
"""

    lc_msgs = [SystemMessage(content=system)]
    for m in history:
        if not isinstance(m, dict):
            continue
        if m.get("role") == "user":
            lc_msgs.append(HumanMessage(content=m.get("content", "")))
        elif m.get("role") == "assistant":
            lc_msgs.append(AIMessage(content=m.get("content", "")))

    response = llm.invoke(lc_msgs)
    reply = response.content.strip()

    extracted = extract_info(history_to_text(history), llm)

    result = {
        "last_reply":       reply,
        "patient_name":     extracted.get("patient_name")     or state.get("patient_name"),
        "patient_age":      extracted.get("patient_age")      or state.get("patient_age"),
        "patient_query":    extracted.get("patient_query")    or state.get("patient_query"),
        "assigned_doctor":  extracted.get("assigned_doctor")  or state.get("assigned_doctor"),
        "appointment_slot": extracted.get("appointment_slot") or state.get("appointment_slot"),
        "consultation_fee": extracted.get("consultation_fee") or state.get("consultation_fee"),
        "patient_email":    extracted.get("patient_email")    or state.get("patient_email"),
    }

    return result


# ── Extract Info ──────────────────────────────────────────────────────────────

def extract_info(conversation: str, llm) -> dict:
    if not conversation:
        return {}
    try:
        response = llm.invoke([HumanMessage(content=f"""Extract patient info from this conversation.
The conversation may be in English, Hindi, or Marathi. Translate extracted info into English if needed.
Return ONLY valid JSON with these keys (null if not found):
- patient_name
- patient_age
- patient_query
- assigned_doctor
- appointment_slot
- consultation_fee    <-- must be a plain NUMBER only, no currency symbols, no ₹ sign
- patient_email

For patient_email: only extract if it looks like a real email address (contains @ and .)
For consultation_fee: return ONLY the numeric value e.g. 1000 not ₹1000

Conversation:
{conversation}

JSON:""")])
        text = response.content.strip()
        match = re.search(r'\{.*\}', text, re.DOTALL)
        if match:
            data = json.loads(match.group())
            # ── Clean fee: strip any currency symbols/spaces ──────────────
            if data.get("consultation_fee") is not None:
                fee_raw = str(data["consultation_fee"])
                fee_clean = re.sub(r'[^\d.]', '', fee_raw)  # keep digits and dot only
                data["consultation_fee"] = float(fee_clean) if fee_clean else None
            return data
    except Exception as e:
        print(f"[Extract] {e}")
    return {}


# ── Node: Check Complete ──────────────────────────────────────────────────────

def check_complete(state: PatientState) -> dict:
    complete = bool(
        state.get("patient_name") and
        state.get("patient_age") and
        state.get("patient_query") and
        state.get("assigned_ward") and
        state.get("assigned_doctor") and
        state.get("appointment_slot") and
        state.get("patient_email")
    )
    return {
        "data_complete": complete,
        "last_reply":    state.get("last_reply", ""),
    }


# ── Node: Webhook + Email ─────────────────────────────────────────────────────

async def webhook_node(state: PatientState) -> dict:
    if state.get("patient_email") and state.get("data_complete"):
        try:
            from services.email_service import send_appointment_email
            send_appointment_email(
                patient_name=state.get("patient_name"),
                patient_email=state.get("patient_email"),
                doctor=state.get("assigned_doctor"),
                ward=state.get("assigned_ward"),
                slot=state.get("appointment_slot"),
                fee=state.get("consultation_fee") or 0,
            )
        except Exception as e:
            print(f"[Email Error] {e}")

    url = os.getenv("WEBHOOK_URL", "")
    if not url or "dummy" in url or not state.get("data_complete"):
        return {"last_reply": state.get("last_reply", "")}
    try:
        async with httpx.AsyncClient(timeout=10) as client:
            await client.post(url, json={
                "patient_name":  state.get("patient_name"),
                "patient_age":   state.get("patient_age"),
                "patient_query": state.get("patient_query"),
                "ward":          state.get("assigned_ward"),
                "doctor":        state.get("assigned_doctor"),
                "slot":          state.get("appointment_slot"),
                "fee":           state.get("consultation_fee"),
                "email":         state.get("patient_email"),
                "timestamp":     datetime.utcnow().isoformat(),
            })
    except Exception as e:
        print(f"[Webhook] {e}")
    return {"last_reply": state.get("last_reply", "")}


# ── Routing ───────────────────────────────────────────────────────────────────

def should_continue(state: PatientState) -> str:
    return "webhook" if state.get("data_complete") else END


# ── Build Graph ───────────────────────────────────────────────────────────────

def build_graph():
    g = StateGraph(PatientState)
    g.add_node("router",   router_node)
    g.add_node("ward",     ward_node)
    g.add_node("complete", check_complete)
    g.add_node("webhook",  webhook_node)
    g.set_entry_point("router")
    g.add_edge("router",   "ward")
    g.add_edge("ward",     "complete")
    g.add_conditional_edges("complete", should_continue,
                            {"webhook": "webhook", END: END})
    g.add_edge("webhook", END)
    return g.compile()


# ── Session Store ─────────────────────────────────────────────────────────────

_sessions: dict = {}

def get_session(session_id: str) -> PatientState:
    if session_id not in _sessions:
        _sessions[session_id] = {
            "chat_history":       [],
            "patient_name":       None,
            "patient_age":        None,
            "patient_query":      None,
            "assigned_ward":      None,
            "assigned_doctor":    None,
            "appointment_slot":   None,
            "consultation_fee":   None,
            "patient_email":      None,
            "data_complete":      False,
            "last_reply":         "",
            "hospital_name":      None,
            "hospital_type":      None,
            "hospital_area":      None,
            "hospital_specialties": None,
        }
    return _sessions[session_id]


# ── Main ──────────────────────────────────────────────────────────────────────

async def run_chat(
    session_id: str,
    user_message: str,
    hospital_name: str = None,
    hospital_type: str = None,
    hospital_area: str = None,
    hospital_specialties: list = None,
) -> dict:
    graph = build_graph()
    state = get_session(session_id)

    # Store hospital context into session (only on first message or if updated)
    if hospital_name:
        state["hospital_name"] = hospital_name
    if hospital_type:
        state["hospital_type"] = hospital_type
    if hospital_area:
        state["hospital_area"] = hospital_area
    if hospital_specialties:
        state["hospital_specialties"] = hospital_specialties

    state["chat_history"].append({"role": "user", "content": user_message})

    result = await graph.ainvoke(state)

    reply = result.get("last_reply", "Sorry, please try again.")
    result["chat_history"].append({"role": "assistant", "content": reply})

    _sessions[session_id] = result

    summary = None
    if result.get("data_complete"):
        summary = {
            "patient_name":  result.get("patient_name"),
            "patient_age":   result.get("patient_age"),
            "patient_query": result.get("patient_query"),
            "ward":          result.get("assigned_ward"),
            "doctor":        result.get("assigned_doctor"),
            "slot":          result.get("appointment_slot"),
            "fee":           result.get("consultation_fee"),
            "email":         result.get("patient_email"),
        }

    return {
        "reply":            reply,
        "ward":             result.get("assigned_ward"),
        "data_complete":    result.get("data_complete", False),
        "patient_summary":  summary,
        "assigned_doctor":  result.get("assigned_doctor"),
        "appointment_slot": result.get("appointment_slot"),
        "consultation_fee": result.get("consultation_fee"),
        "patient_email":    result.get("patient_email"),
    }