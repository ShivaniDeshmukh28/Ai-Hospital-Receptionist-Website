import os
from langchain_groq import ChatGroq
from langchain_core.prompts import ChatPromptTemplate
from langchain_core.output_parsers import JsonOutputParser
from models.schemas import SymptomGuidanceOutput


class TriageService:
    def __init__(self):
        api_key = os.getenv("GROQ_API_KEY")
        if not api_key:
            raise ValueError("GROQ_API_KEY environment variable is missing.")

        # Low temperature for precise, safe output
        self.llm = ChatGroq(
            temperature=0.1,
            model_name="llama-3.1-70b-versatile",
            api_key=api_key,
        )
        self.parser = JsonOutputParser(pydantic_object=SymptomGuidanceOutput)

        self.system_prompt = """
        You are an official AI Triage Assistant for a hospital kiosk.
        Analyze the patient's described symptoms and return a JSON object with:
        1. "urgency_level": 'LOW', 'MODERATE', or 'EMERGENCY'.
        2. "recommended_ward": Recommended hospital department (e.g., General Medicine, Cardiology, Orthopedics, Emergency, Dermatology, Pulmonology).
        3. "first_aid_guidance": 2-3 short, safe, practical immediate guidance steps while waiting for doctor.
        4. "verified_disclaimer": Standard medical disclaimer statement.

        Safety Rules:
        - If symptoms indicate severe chest pain, extreme bleeding, or loss of consciousness, mark 'EMERGENCY'.
        - Keep first-aid advice safe, generic, and actionable. Do NOT prescribe specific medicine names.

        {format_instructions}
        """

        self.prompt = ChatPromptTemplate.from_messages([
            ("system", self.system_prompt),
            ("user", "Patient Symptoms: {symptoms}"),
        ]).partial(format_instructions=self.parser.get_format_instructions())

        self.chain = self.prompt | self.llm | self.parser

    async def analyze_symptoms(self, symptoms: str) -> dict:
        return self.chain.invoke({"symptoms": symptoms})


triage_service = TriageService()