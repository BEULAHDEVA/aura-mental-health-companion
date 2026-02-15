import os
import httpx
from dotenv import load_dotenv

load_dotenv()

DEEPGRAM_API_KEY = os.getenv("DEEPGRAM_API_KEY")
DEEPGRAM_URL = "https://api.deepgram.com/v1/listen?model=nova-2&smart_format=true"

async def transcribe_audio_deepgram(audio_data: bytes):
    if not DEEPGRAM_API_KEY:
        return "Deepgram API key not configured."

    headers = {
        "Authorization": f"Token {DEEPGRAM_API_KEY}",
        "Content-Type": "audio/wav" # Defaulting to wav, can be adjusted based on frontend blob
    }

    async with httpx.AsyncClient() as client:
        response = await client.post(
            DEEPGRAM_URL,
            headers=headers,
            content=audio_data,
            timeout=30.0
        )
        
        if response.status_code == 200:
            result = response.json()
            return result.get("results", {}).get("channels", [{}])[0].get("alternatives", [{}])[0].get("transcript", "")
        else:
            print(f"Deepgram Error: {response.text}")
            return f"Error transcribing audio: {response.status_code}"
