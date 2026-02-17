import asyncio
from app.services import groq_service
from app.services import gemini_service
import os

async def test_services():
    print("Testing Groq Service...")
    try:
        response = await groq_service.get_groq_response("Hello, how are you?")
        print("Groq Response:", response)
    except Exception as e:
        print("Groq Error:", e)

    print("\nTesting Gemini Service...")
    try:
        response = await gemini_service.get_gemini_response("Hello, how are you?")
        print("Gemini Response:", response)
    except Exception as e:
        print("Gemini Error:", e)

if __name__ == "__main__":
    asyncio.run(test_services())
