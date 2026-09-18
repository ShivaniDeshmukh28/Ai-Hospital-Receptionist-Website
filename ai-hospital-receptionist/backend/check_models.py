import os
from dotenv import load_dotenv
import requests

load_dotenv()

api_key = os.getenv("GROQ_API_KEY")
if not api_key:
    print("GROQ_API_KEY not found in .env")
else:
    r = requests.get(
        "https://api.groq.com/openai/v1/models",
        headers={"Authorization": f"Bearer {api_key}"},
    )
    print("Status:", r.status_code)
    if r.status_code == 200:
        for m in r.json().get("data", []):
            print(m["id"])
    else:
        print(r.text)
