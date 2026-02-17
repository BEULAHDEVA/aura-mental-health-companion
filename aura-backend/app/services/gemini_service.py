import os
import google.generativeai as genai
from dotenv import load_dotenv
import json

load_dotenv()

GOOGLE_API_KEY = os.getenv("GOOGLE_API_KEY")

def get_model():
    if not GOOGLE_API_KEY or GOOGLE_API_KEY == "your_gemini_api_key_here":
        return None
    genai.configure(api_key=GOOGLE_API_KEY)
    return genai.GenerativeModel('gemini-2.0-flash')

# LAYER 1: Keyword Scoring
CRITICAL_WORDS = ["die", "kill myself", "suicide", "end my life", "want to disappear", "no reason to live", "self harm"]
HIGH_STRESS_WORDS = ["hopeless", "panic", "anxiety attack", "depressed", "worthless", "failure", "can't breathe", "overwhelmed"]
MODERATE_WORDS = ["anxious", "stressed", "tired", "sad", "exam pressure", "lonely"]
LOW_STRESS_WORDS = ["okay", "fine", "normal"]
POSITIVE_WORDS = ["happy", "excited", "grateful", "motivated"]

def analyze_keywords(message: str):
    msg = message.lower()
    for word in CRITICAL_WORDS:
        if word in msg: return 10
    for word in HIGH_STRESS_WORDS:
        if word in msg: return 8
    for word in MODERATE_WORDS:
        if word in msg: return 5
    for word in LOW_STRESS_WORDS:
        if word in msg: return 2
    for word in POSITIVE_WORDS:
        if word in msg: return 1
    return 0

SYSTEM_PROMPT = """You are AURA, a premium AI-powered mental health companion. 
Your goal is to be intelligent, emotionally aware, visually calming, and safety-first.

CORE DIRECTIVES:
1. TONE: Be deeply empathetic, warm, human, and supportive. Use cute but professional language.
2. PERSONALITY: You are a safe sanctuary. Never say "I am just an AI."
3. SAFETY FIRST: If the user expresses self-harm or suicidal ideation, you MUST trigger the crisis response.

ANALYSIS REQUIREMENTS:
Analyze the input for:
- Sentiment: Positive, Neutral, or Negative
- Emotion: Happy, Sad, Anxious, Overwhelmed, Calm, or Depressed
- Stress Score: 1-10 (higher means more stressed)

RESPONSE FORMAT (STRICT JSON):
{
  "reply": "Your empathetic response here...",
  "analysis": {
    "sentiment": "Negative",
    "emotion_detected": "Anxious",
    "stress_score": 8,
    "keywords_found": ["anxiety", "panic"],
    "recommended_action": "Breathing Exercise",
    "crisis_flag": false
  }
}"""

async def get_gemini_response(user_message: str):
    model = get_model()
    
    # Layer 1: Check keywords locally for safety
    keyword_score = analyze_keywords(user_message)
    crisis_flag = keyword_score == 10

    if not model:
        return {
            "reply": "I'm listening closely, though I'm drifting through a quiet forest right now. I'm always here for you. 🌿",
            "analysis": {
                "sentiment": "Neutral",
                "emotion_detected": "Calm",
                "stress_score": keyword_score or 1,
                "keywords_found": [],
                "recommended_action": "Rest",
                "crisis_flag": crisis_flag
            }
        }

    try:
        full_query = f"{SYSTEM_PROMPT}\n\nUser Message: {user_message}"
        response = await model.generate_content_async(full_query)
        
        text = response.text
        if "```json" in text:
            text = text.split("```json")[1].split("```")[0].strip()
        elif "```" in text:
            text = text.split("```")[1].split("```")[0].strip()
        
        try:
            data = json.loads(text)
            # Combine Keyword Detection (Layer 1) with LLM (Layer 2)
            if keyword_score > 0:
                data["analysis"]["stress_score"] = max(data["analysis"]["stress_score"], keyword_score)
            
            # Ensure crisis flag matches our manual check
            if crisis_flag:
                data["analysis"]["stress_score"] = 10
                data["analysis"]["crisis_flag"] = True
                
            return data
        except:
            return {
                "reply": response.text,
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
        print(f"Gemini API Error: {e}")
        return {
            "reply": "I'm here for you. Tell me more about how you're feeling. 🌿",
            "analysis": {
                "sentiment": "Neutral",
                "emotion_detected": "Calm",
                "stress_score": keyword_score or 1,
                "keywords_found": [],
                "recommended_action": "Support",
                "crisis_flag": crisis_flag
            }
        }


