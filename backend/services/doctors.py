DOCTORS = {
    "General Ward": [
        {
            "name": "Dr. Rajesh Sharma",
            "specialization": "General Physician",
            "fee": 500,
            "slots": ["10:00 AM", "11:00 AM", "2:00 PM", "4:00 PM"],
        },
        {
            "name": "Dr. Sunita Patil",
            "specialization": "Family Medicine",
            "fee": 400,
            "slots": ["9:00 AM", "12:00 PM", "3:00 PM", "5:00 PM"],
        },
    ],
    "Emergency Ward": [
        {
            "name": "Dr. Priya Patel",
            "specialization": "Emergency Medicine",
            "fee": 1000,
            "slots": ["Immediate"],
        },
    ],
    "Mental Health Ward": [
        {
            "name": "Dr. Arjun Mehta",
            "specialization": "Psychiatrist",
            "fee": 800,
            "slots": ["11:00 AM", "3:00 PM", "5:00 PM"],
        },
    ],
}

def get_doctors_for_ward(ward):
    return DOCTORS.get(ward, [])

def get_doctor_info(ward, doctor_name):
    for doc in get_doctors_for_ward(ward):
        if doc["name"].lower() == doctor_name.lower():
            return doc
    return {}

def format_doctors_for_prompt(ward):
    doctors = get_doctors_for_ward(ward)
    lines = []
    for i, doc in enumerate(doctors, 1):
        slots = ", ".join(doc["slots"])
        lines.append(f"{i}. {doc['name']} ({doc['specialization']}) — Fee: ₹{doc['fee']} — Slots: {slots}")
    return "\n".join(lines)