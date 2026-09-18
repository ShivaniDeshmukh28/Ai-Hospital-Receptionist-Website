"""
Doctors database with location-based filtering
"""

DOCTORS = {
    "General Ward": [
        {
            "name": "Dr. Rajesh Sharma",
            "specialization": "General Physician",
            "fee": 500,
            "slots": ["10:00 AM", "11:00 AM", "3:00 PM"],
            "hospital": "City General Hospital",
            "area": "Osmanabad",
            "city": "Osmanabad",
            "lat": 18.1769,
            "lng": 76.0391,
            "distance_km": 0,
        },
        {
            "name": "Dr. Priya Patel",
            "specialization": "Family Medicine",
            "fee": 400,
            "slots": ["9:00 AM", "12:00 PM", "4:00 PM"],
            "hospital": "Apollo Clinic",
            "area": "Solapur Road",
            "city": "Solapur",
            "lat": 17.6868,
            "lng": 75.9005,
            "distance_km": 0,
        },
        {
            "name": "Dr. Anand Kulkarni",
            "specialization": "General Physician",
            "fee": 350,
            "slots": ["8:00 AM", "11:00 AM", "2:00 PM"],
            "hospital": "Kulkarni Clinic",
            "area": "Station Road",
            "city": "Latur",
            "lat": 18.4088,
            "lng": 76.5604,
            "distance_km": 0,
        },
        {
            "name": "Dr. Sunita Desai",
            "specialization": "General Physician",
            "fee": 450,
            "slots": ["10:00 AM", "1:00 PM", "5:00 PM"],
            "hospital": "Desai Medical Center",
            "area": "Camp Area",
            "city": "Aurangabad",
            "lat": 19.8762,
            "lng": 75.3433,
            "distance_km": 0,
        },
    ],
    "Emergency Ward": [
        {
            "name": "Dr. Arjun Mehta",
            "specialization": "Emergency Medicine",
            "fee": 1000,
            "slots": ["Available 24/7"],
            "hospital": "Government Hospital",
            "area": "Civil Lines",
            "city": "Solapur",
            "lat": 17.6868,
            "lng": 75.9005,
            "distance_km": 0,
        },
        {
            "name": "Dr. Sunita Rao",
            "specialization": "Critical Care",
            "fee": 1200,
            "slots": ["Available 24/7"],
            "hospital": "Emergency Care Center",
            "area": "Main Road",
            "city": "Aurangabad",
            "lat": 19.8762,
            "lng": 75.3433,
            "distance_km": 0,
        },
    ],
    "Mental Health Ward": [
        {
            "name": "Dr. Anil Desai",
            "specialization": "Psychiatrist",
            "fee": 800,
            "slots": ["11:00 AM", "2:00 PM", "5:00 PM"],
            "hospital": "Mind Care Clinic",
            "area": "Shivaji Nagar",
            "city": "Solapur",
            "lat": 17.6868,
            "lng": 75.9005,
            "distance_km": 0,
        },
        {
            "name": "Dr. Meera Joshi",
            "specialization": "Clinical Psychologist",
            "fee": 700,
            "slots": ["10:00 AM", "1:00 PM", "4:00 PM"],
            "hospital": "Wellness Center",
            "area": "University Road",
            "city": "Aurangabad",
            "lat": 19.8762,
            "lng": 75.3433,
            "distance_km": 0,
        },
    ],
}


import math

def calculate_distance(lat1, lng1, lat2, lng2) -> float:
    """Calculate distance between two coordinates in km using Haversine formula."""
    R = 6371  # Earth radius in km
    d_lat = math.radians(lat2 - lat1)
    d_lng = math.radians(lng2 - lng1)
    a = (math.sin(d_lat/2)**2 +
         math.cos(math.radians(lat1)) *
         math.cos(math.radians(lat2)) *
         math.sin(d_lng/2)**2)
    c = 2 * math.atan2(math.sqrt(a), math.sqrt(1-a))
    return round(R * c, 1)


def get_doctors_for_ward(ward: str, user_lat=None, user_lng=None) -> list:
    """Get doctors for a ward, sorted by distance if location provided."""
    doctors = DOCTORS.get(ward, [])
    result = []
    for doc in doctors:
        d = dict(doc)
        if user_lat and user_lng:
            d["distance_km"] = calculate_distance(
                user_lat, user_lng, doc["lat"], doc["lng"]
            )
        result.append(d)

    # Sort by distance if location available
    if user_lat and user_lng:
        result.sort(key=lambda x: x["distance_km"])

    return result


def get_doctor_info(ward: str, doctor_name: str) -> dict:
    for doc in DOCTORS.get(ward, []):
        if doc["name"].lower() == doctor_name.lower():
            return doc
    return {}


def format_doctors_for_prompt(ward: str, user_lat=None, user_lng=None) -> str:
    """Format doctors list for AI prompt, with distance if available."""
    doctors = get_doctors_for_ward(ward, user_lat, user_lng)
    lines = []
    for i, doc in enumerate(doctors, 1):
        slots = ", ".join(doc["slots"])
        if user_lat and user_lng and doc.get("distance_km", 0) > 0:
            dist = f" | 📍 {doc['distance_km']} km away"
        else:
            dist = ""
        lines.append(
            f"{i}. {doc['name']} ({doc['specialization']})\n"
            f"   🏥 {doc['hospital']}, {doc['area']}, {doc['city']}{dist}\n"
            f"   💰 Fee: ₹{doc['fee']} | ⏰ Slots: {slots}"
        )
    return "\n\n".join(lines)