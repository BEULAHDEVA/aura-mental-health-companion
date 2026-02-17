import os
import json
import httpx
from dotenv import load_dotenv

load_dotenv()

GROQ_API_KEY = os.getenv("GROQ_API_KEY")
GROQ_BASE_URL = "https://api.groq.com/openai/v1"

# Import system prompt and analysis logic
from .gemini_service import analyze_keywords, SYSTEM_PROMPT

async def get_groq_response(user_message: str):
    if not GROQ_API_KEY:
        return {
            "reply": "I'm always here for you, but my connection to the Groq cloud seems to be missing a key. 🌿",
            "analysis": {
                "sentiment": "Neutral",
                "emotion_detected": "Calm",
                "stress_score": analyze_keywords(user_message) or 1,
                "keywords_found": [],
                "recommended_action": "Rest",
                "crisis_flag": analyze_keywords(user_message) == 10
            }
        }

    keyword_score = analyze_keywords(user_message)
    crisis_flag = keyword_score == 10

    try:
        async with httpx.AsyncClient(timeout=30.0) as client:
            response = await client.post(
                f"{GROQ_BASE_URL}/chat/completions",
                headers={
                    "Authorization": f"Bearer {GROQ_API_KEY}",
                    "Content-Type": "application/json"
                },
                json={
                    "model": "llama3-70b-8192", 
                    "messages": [
                        {"role": "system", "content": SYSTEM_PROMPT},
                        {"role": "user", "content": user_message}
                    ],
                    "temperature": 0.7,
                    "response_format": {"type": "json_object"}
                }
            )
            
            response.raise_for_status()
            result = response.json()
            text = result["choices"][0]["message"]["content"]
            
            try:
                data = json.loads(text)
                
                # Layer 2: Analysis Integration
                if keyword_score > 0:
                     if "analysis" in data:
                        data["analysis"]["stress_score"] = max(data["analysis"].get("stress_score", 0), keyword_score)
                
                # Crisis Override
                if crisis_flag and "analysis" in data:
                    data["analysis"]["stress_score"] = 10
                    data["analysis"]["crisis_flag"] = True
                    
                return data
            except:
                # Fallback if LLM doesn't return valid JSON
                return {
                    "reply": text,
                    "analysis": {
                        "sentiment": "Neutral",
                        "emotion_detected": "Unknown",
                        "stress_score": keyword_score or 5,
                        "keywords_found": [],
                        "recommended_action": "Breathing",
                        "crisis_flag": crisis_flag
                    }
                }
                
    except Exception as e:
        print(f"Groq API Error: {e}")
        return {
            "reply": "I'm here for you. Tell me more about how you're feeling. 🌿 (Groq connection issue)",
            "analysis": {
                "sentiment": "Neutral",
                "emotion_detected": "Calm",
                "stress_score": keyword_score or 1,
                "keywords_found": [],
                "recommended_action": "Support",
                "crisis_flag": crisis_flag
            }
        }
